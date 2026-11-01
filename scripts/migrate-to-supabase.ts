/**
 * One-time migration: seed the Supabase database from the bundled data and
 * upload every photo to the "media" storage bucket.
 *
 *   npx tsx scripts/migrate-to-supabase.ts
 *
 * Safe to re-run -- everything is an upsert, nothing is deleted.
 */

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";

import { projects } from "@/data/projects";
import { categories } from "@/data/categories";
import { services } from "@/data/services";
import { pricing } from "@/data/pricing";
import { testimonials } from "@/data/testimonials";
import { translations } from "@/lib/i18n";
import { CONTACT_INFO } from "@/lib/utils";

const BUCKET = "media";
const IMAGES_ROOT = join(process.cwd(), "public", "images");

// ---------------------------------------------------------------------------
// env
// ---------------------------------------------------------------------------
function loadEnvLocal() {
  const file = join(process.cwd(), ".env.local");
  if (!existsSync(file)) return false;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = /^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
    if (!m) continue;
    const value = m[2].replace(/^["']|["']$/g, "");
    if (!process.env[m[1]]) process.env[m[1]] = value;
  }
  return true;
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "\nMissing credentials.\n" +
      "Add these to .env.local in the project root:\n\n" +
      "  NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co\n" +
      "  SUPABASE_SERVICE_ROLE_KEY=eyJ...\n\n" +
      "Find both under Project Settings -> API in the Supabase dashboard.\n",
  );
  process.exit(1);
}

const db = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

/** "/images/painting/painting-01.jpg" -> "painting/painting-01.jpg" */
const toStoragePath = (src: string): string =>
  src.replace(/^https?:\/\/[^/]+\/storage\/v1\/object\/public\/[^/]+\//, "").replace(
    /^\/images\//,
    "",
  );

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".heic": "image/heic",
};

/** Flattens nested translation objects into dotted keys. */
function flatten(
  obj: Record<string, unknown>,
  prefix = "",
  out: Record<string, string> = {},
): Record<string, string> {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      flatten(v as Record<string, unknown>, key, out);
    } else {
      out[key] = typeof v === "string" ? v : String(v ?? "");
    }
  }
  return out;
}

async function upsert(table: string, rows: unknown[]) {
  const { error } = await db.from(table).upsert(rows as never);
  if (error) {
    console.error(`  FAILED ${table}: ${error.message}`);
    process.exitCode = 1;
  } else {
    console.log(`  ${table}: ${rows.length} rows`);
  }
}

// ---------------------------------------------------------------------------
// 1. photos
// ---------------------------------------------------------------------------
async function uploadPhotos() {
  console.log("\n1. Uploading photos");

  if (!existsSync(IMAGES_ROOT)) {
    console.log(`  no ${IMAGES_ROOT} -- skipping`);
    return;
  }

  const folders = readdirSync(IMAGES_ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  let uploaded = 0;
  let skipped = 0;
  const mediaRows: Record<string, unknown>[] = [];

  for (const folder of folders) {
    const dir = join(IMAGES_ROOT, folder);
    const files = readdirSync(dir)
      .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
      .sort();

    for (const filename of files) {
      const full = join(dir, filename);
      const ext = filename.slice(filename.lastIndexOf(".")).toLowerCase();
      const storagePath = `${folder}/${filename}`;

      const { error } = await db.storage
        .from(BUCKET)
        .upload(storagePath, readFileSync(full), {
          contentType: MIME[ext] ?? "application/octet-stream",
          cacheControl: "31536000",
          upsert: true,
        });

      if (error) {
        console.error(`  FAILED ${storagePath}: ${error.message}`);
        process.exitCode = 1;
        continue;
      }

      uploaded++;
      mediaRows.push({
        path: storagePath,
        filename,
        mime: MIME[ext] ?? "application/octet-stream",
        size_bytes: statSync(full).size,
        folder,
      });

      if (uploaded % 20 === 0) console.log(`  ...${uploaded} uploaded`);
    }
  }

  // HEIC files are not web-playable, but keep a record so nothing is silently lost.
  skipped = readdirSync(IMAGES_ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .flatMap((d) => readdirSync(join(IMAGES_ROOT, d.name)))
    .filter((f) => /\.heic$/i.test(f)).length;
  if (skipped) console.log(`  (${skipped} .heic files not uploaded - not browser-playable)`);

  await upsert("media", mediaRows);
  console.log(`  ${uploaded} photos uploaded to "${BUCKET}"`);
}

// ---------------------------------------------------------------------------
// 2. content
// ---------------------------------------------------------------------------
async function seedContent() {
  console.log("\n2. Seeding content");

  await upsert(
    "categories",
    categories.map((c, i) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      description: c.description ?? null,
      sort_order: i,
    })),
  );

  await upsert(
    "services",
    services.map((s, i) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      icon: s.icon,
      starting_price: s.startingPrice ?? null,
      unit: s.unit ?? null,
      sort_order: i,
    })),
  );

  await upsert(
    "prices",
    pricing.map((p, i) => ({
      id: p.id,
      service: p.service,
      category: p.category,
      description: p.description,
      unit: p.unit,
      price_from: p.priceFrom,
      price_to: p.priceTo ?? null,
      currency: p.currency,
      notes: p.notes ?? null,
      sort_order: i,
    })),
  );

  await upsert(
    "testimonials",
    testimonials.map((t, i) => ({
      id: t.id,
      name: t.name,
      project: t.project ?? null,
      review: t.review,
      rating: t.rating ?? null,
      review_date: t.date ?? null,
      photo_path: t.photo ? toStoragePath(t.photo) : null,
      is_placeholder: t.isPlaceholder,
      sort_order: i,
    })),
  );

  await upsert(
    "projects",
    projects.map((p, i) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      category: p.category,
      location: p.location,
      description: p.description,
      services: p.services,
      year: p.year,
      cover_path: toStoragePath(p.coverImage),
      images: p.images.map(toStoragePath),
      before_path: p.beforeImage ? toStoragePath(p.beforeImage) : null,
      after_path: p.afterImage ? toStoragePath(p.afterImage) : null,
      featured: p.featured,
      sort_order: i,
      created_at: p.createdAt,
    })),
  );
}

// ---------------------------------------------------------------------------
// 3. site copy
// ---------------------------------------------------------------------------
async function seedSiteText() {
  console.log("\n3. Seeding site copy and settings");

  const en = flatten(translations.en as Record<string, unknown>);
  const fr = flatten(translations.fr as Record<string, unknown>);
  const ar = flatten(translations.ar as Record<string, unknown>);

  const keys = new Set([...Object.keys(en), ...Object.keys(fr), ...Object.keys(ar)]);
  const rows = [...keys].map((key) => ({
    key,
    value: { en: en[key] ?? "", fr: fr[key] ?? "", ar: ar[key] ?? "" },
  }));

  await upsert("site_text", rows);

  const missing = rows.filter((r) => !r.value.fr || !r.value.ar).length;
  if (missing) {
    console.log(`  warning: ${missing} keys have an empty fr or ar translation`);
  }

  await upsert("settings", [{ key: "contact", value: CONTACT_INFO }]);
}

// ---------------------------------------------------------------------------
async function main() {
  console.log(`Target: ${url}`);
  await uploadPhotos();
  await seedContent();
  await seedSiteText();
  console.log(
    process.exitCode
      ? "\nFinished with errors -- see above."
      : "\nDone. Restart the dev server: npm run dev",
  );
}

main();
