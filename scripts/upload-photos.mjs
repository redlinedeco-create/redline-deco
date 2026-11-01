/**
 * Uploads every photo in public/images to the Supabase "media" bucket.
 *
 *   node scripts/upload-photos.mjs
 *
 * Needs SUPABASE_STORAGE_KEY (storage-scoped secret) or SUPABASE_SERVICE_ROLE_KEY
 * in .env.local. Only touches storage -- it never writes table rows -- so it
 * works with a storage-scoped key.
 *
 * Safe to re-run: an existing object is left alone rather than overwritten,
 * because overwriting would break any project already referencing that path.
 * Writes the media rows it would have inserted to scripts/.media-rows.json so
 * they can be seeded into the media table separately.
 */

import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BUCKET = "media";
const IMAGES_ROOT = join(process.cwd(), "public", "images");
const OUT = join(process.cwd(), "scripts", ".media-rows.json");

function loadEnvLocal() {
  const file = join(process.cwd(), ".env.local");
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = /^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
    if (!m) continue;
    const value = m[2].replace(/^["']|["']$/g, "");
    if (!process.env[m[1]]) process.env[m[1]] = value;
  }
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_STORAGE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !secret) {
  console.error(
    "\nMissing credentials. Add one of these to .env.local:\n\n" +
      "  NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co\n" +
      "  SUPABASE_STORAGE_KEY=sb_secret_...\n\n",
  );
  process.exit(1);
}

const MIME = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

async function storage(path, init = {}) {
  const res = await fetch(`${url}/storage/v1/object/${BUCKET}/${path}`, {
    ...init,
    headers: {
      apikey: secret,
      Authorization: `Bearer ${secret}`,
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${await res.text()}`);
  }
  return res;
}

async function main() {
  if (!existsSync(IMAGES_ROOT)) {
    console.error(`No ${IMAGES_ROOT}`);
    process.exit(1);
  }

  const folders = readdirSync(IMAGES_ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  // What is already in the bucket, so re-runs skip instead of failing.
  const existing = new Set();
  for (const folder of folders) {
    try {
      const res = await storage(`${folder}/`, { method: "GET" });
      const list = await res.json();
      for (const obj of list ?? []) existing.add(`${folder}/${obj.name}`);
    } catch {
      // A folder that does not exist yet just means nothing to skip.
    }
  }

  let uploaded = 0;
  let skipped = 0;
  let heic = 0;
  let failed = 0;
  const rows = [];

  for (const folder of folders) {
    const dir = join(IMAGES_ROOT, folder);
    const files = readdirSync(dir).sort();

    for (const filename of files) {
      const ext = filename.slice(filename.lastIndexOf(".")).toLowerCase();

      if (ext === ".heic") {
        heic++;
        continue;
      }
      const contentType = MIME[ext];
      if (!contentType) continue;

      const path = `${folder}/${filename}`;
      const full = join(dir, filename);

      if (existing.has(path)) {
        skipped++;
        rows.push({
          path,
          filename,
          mime: contentType,
          size_bytes: statSync(full).size,
          folder,
        });
        continue;
      }

      try {
        await storage(path, {
          method: "POST",
          headers: { "Content-Type": contentType, "Cache-Control": "31536000" },
          body: readFileSync(full),
        });
        uploaded++;
        rows.push({
          path,
          filename,
          mime: contentType,
          size_bytes: statSync(full).size,
          folder,
        });
        if (uploaded % 25 === 0) console.log(`  ...${uploaded} uploaded`);
      } catch (e) {
        failed++;
        console.error(`  FAILED ${path}: ${e.message}`);
      }
    }
  }

  writeFileSync(OUT, JSON.stringify(rows, null, 0), "utf8");

  console.log(`\n  uploaded: ${uploaded}`);
  console.log(`  already present: ${skipped}`);
  console.log(`  .heic skipped (not browser-playable): ${heic}`);
  console.log(`  failed: ${failed}`);
  console.log(`\n  media rows written to scripts/.media-rows.json (${rows.length})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});