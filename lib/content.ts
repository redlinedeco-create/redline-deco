import "server-only";

import type { Category, Price, Project, ServiceItem, Testimonial } from "@/types";
import { getReadClient, mediaUrl, mediaUrls } from "./supabase/server";

// The bundled data is the fallback whenever Supabase is unreachable, unseeded,
// or not configured yet. The site must never render blank because a database is
// having a bad day.
import { projects as bundledProjects } from "@/data/projects";
import { categories as bundledCategories } from "@/data/categories";
import { services as bundledServices } from "@/data/services";
import { pricing as bundledPricing } from "@/data/pricing";
import { testimonials as bundledTestimonials } from "@/data/testimonials";
import { getLocalSubmissions } from "@/lib/local-testimonials";

type Row = Record<string, unknown>;

/** Matches the { en, fr, ar } shape the rest of the app already uses. */
type I18n = { en: string; fr: string; ar: string };

/**
 * Reads a table, mapping rows into the app's own types. Falls back to the
 * bundled data on any error, and also when the table comes back empty -- an
 * un-seeded database should show the built-in content rather than a blank page.
 */
async function read<T>(
  table: string,
  map: (row: Row) => T,
  fallback: T[],
): Promise<T[]> {
  const client = getReadClient();
  if (!client) return fallback;

  const { data, error } = await client
    .from(table)
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.warn(
      `[content] "${table}" read failed, serving bundled data: ${error.message}`,
    );
    return fallback;
  }
  if (!data || data.length === 0) {
    console.warn(
      `[content] "${table}" is empty. Run: node scripts/migrate-to-supabase.mjs`,
    );
    return fallback;
  }
  return (data as Row[]).map(map);
}

const i18n = (v: unknown): I18n => {
  const o = v && typeof v === "object" ? (v as Record<string, unknown>) : {};
  return {
    en: typeof o.en === "string" ? o.en : "",
    fr: typeof o.fr === "string" ? o.fr : "",
    ar: typeof o.ar === "string" ? o.ar : "",
  };
};

const str = (v: unknown, fallback = ""): string =>
  typeof v === "string" ? v : fallback;

const strArray = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];

export async function getProjects(): Promise<Project[]> {
  return read<Project>(
    "projects",
    (row) => ({
      id: str(row.id),
      slug: str(row.slug),
      title: i18n(row.title),
      category: str(row.category),
      location: i18n(row.location),
      year: typeof row.year === "number" ? row.year : 0,
      description: i18n(row.description),
      services: strArray(row.services),
      coverImage: mediaUrl(str(row.cover_path)) ?? "",
      images: mediaUrls(strArray(row.images)),
      beforeImage: mediaUrl(str(row.before_path)) ?? undefined,
      afterImage: mediaUrl(str(row.after_path)) ?? undefined,
      featured: row.featured === true,
      createdAt: str(row.created_at).slice(0, 10),
    }),
    bundledProjects,
  );
}

export async function getCategories(): Promise<Category[]> {
  return read<Category>(
    "categories",
    (row) => ({
      id: str(row.id),
      slug: str(row.slug),
      name: i18n(row.name),
      description: row.description ? i18n(row.description) : undefined,
    }),
    bundledCategories,
  );
}

export async function getServices(): Promise<ServiceItem[]> {
  return read<ServiceItem>(
    "services",
    (row) => ({
      id: str(row.id),
      name: i18n(row.name),
      description: i18n(row.description),
      icon: str(row.icon, "layers"),
      startingPrice:
        typeof row.starting_price === "number" ? row.starting_price : undefined,
      unit: row.unit ? i18n(row.unit) : undefined,
    }),
    bundledServices,
  );
}

export async function getPricing(): Promise<Price[]> {
  return read<Price>(
    "prices",
    (row) => ({
      id: str(row.id),
      service: i18n(row.service),
      category: str(row.category),
      description: i18n(row.description),
      unit: i18n(row.unit),
      priceFrom: typeof row.price_from === "number" ? row.price_from : 0,
      priceTo: typeof row.price_to === "number" ? row.price_to : undefined,
      currency: str(row.currency, "DZD"),
      notes: row.notes ? i18n(row.notes) : undefined,
      updatedAt: str(row.updated_at).slice(0, 10),
    }),
    bundledPricing,
  );
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const list = await read<Testimonial>(
    "testimonials",
    (row) => {
      const revObj =
        row.review && typeof row.review === "object"
          ? (row.review as Record<string, unknown>)
          : {};
      const status =
        (typeof row.status === "string" ? row.status : null) ||
        (typeof revObj.status === "string" ? revObj.status : null) ||
        "approved";

      return {
        id: str(row.id),
        name: str(row.name),
        project: str(row.project) || undefined,
        review: i18n(row.review),
        rating: typeof row.rating === "number" ? row.rating : undefined,
        date: str(row.review_date).slice(0, 10) || undefined,
        photo: mediaUrl(str(row.photo_path)) ?? undefined,
        isPlaceholder: row.is_placeholder !== false,
        status: status as "pending" | "approved" | "rejected",
      };
    },
    bundledTestimonials,
  );

  // Only public approved testimonials are displayed on the marketing website
  const approvedList = list.filter((t) => t.status === "approved" || !t.status);

  // Also include any approved submissions from the local fallback buffer
  try {
    const local = getLocalSubmissions();
    const existingIds = new Set(approvedList.map((t) => t.id));
    for (const item of local) {
      if (item.review.status === "approved" && !existingIds.has(item.id)) {
        approvedList.push({
          id: item.id,
          name: item.name,
          project: item.project || undefined,
          review: {
            en: item.review.en,
            fr: item.review.fr,
            ar: item.review.ar,
          },
          rating: typeof item.rating === "number" ? item.rating : undefined,
          date: item.review_date || undefined,
          isPlaceholder: false,
          status: "approved",
        });
      }
    }
  } catch {
    // Ignore local read errors on edge
  }

  return approvedList;
}

export async function getAdminTestimonials(): Promise<Testimonial[]> {
  const list = await read<Testimonial>(
    "testimonials",
    (row) => {
      const revObj =
        row.review && typeof row.review === "object"
          ? (row.review as Record<string, unknown>)
          : {};
      const status =
        (typeof row.status === "string" ? row.status : null) ||
        (typeof revObj.status === "string" ? revObj.status : null) ||
        "approved";
      const phone =
        (typeof row.phone === "string" ? row.phone : null) ||
        (typeof revObj.phone === "string" ? revObj.phone : undefined);

      return {
        id: str(row.id),
        name: str(row.name),
        project: str(row.project) || undefined,
        review: i18n(row.review),
        rating: typeof row.rating === "number" ? row.rating : undefined,
        date: str(row.review_date).slice(0, 10) || undefined,
        photo: mediaUrl(str(row.photo_path)) ?? undefined,
        isPlaceholder: row.is_placeholder !== false,
        status: status as "pending" | "approved" | "rejected",
        phone,
      };
    },
    bundledTestimonials,
  );

  const existingIds = new Set(list.map((t) => t.id));
  const fullList = [...list];

  try {
    const local = getLocalSubmissions();
    for (const item of local) {
      if (!existingIds.has(item.id)) {
        fullList.unshift({
          id: item.id,
          name: item.name,
          project: item.project || undefined,
          review: {
            en: item.review.en,
            fr: item.review.fr,
            ar: item.review.ar,
          },
          rating: typeof item.rating === "number" ? item.rating : undefined,
          date: item.review_date || undefined,
          isPlaceholder: false,
          status: item.review.status || "pending",
          phone: item.phone || item.review.phone,
        });
      }
    }
  } catch {
    // Ignore local read errors on edge
  }

  return fullList;
}

/** All editable UI copy, keyed by dotted i18n path ("hero.headline"). */
export async function getSiteText(): Promise<Record<string, I18n>> {
  const client = getReadClient();
  if (!client) return {};

  const { data, error } = await client.from("site_text").select("key, value");
  if (error || !data) {
    if (error) {
      console.warn(
        `[content] "site_text" read failed, using bundled copy: ${error.message}`,
      );
    }
    return {};
  }

  const out: Record<string, I18n> = {};
  for (const row of data as Row[]) {
    out[str(row.key)] = i18n(row.value);
  }
  return out;
}

/** CONTACT_INFO and any other singleton settings. */
export async function getSettings(): Promise<Record<string, unknown>> {
  const client = getReadClient();
  if (!client) return {};

  const { data, error } = await client.from("settings").select("key, value");
  if (error || !data) return {};

  const out: Record<string, unknown> = {};
  for (const row of data as Row[]) {
    out[str(row.key)] = row.value;
  }
  return out;
}

/**
 * Raw `site_text` rows, keyed by their natural key (`key` is the primary key,
 * there is no `id` column). Used by the admin editor, which addresses rows by
 * that key.
 */
export async function getSiteTextRows(): Promise<
  { key: string; value: Record<string, string> }[]
> {
  const client = getReadClient();
  if (!client) return [];

  const { data, error } = await client
    .from("site_text")
    .select("key, value")
    .order("key", { ascending: true });
  if (error || !data) return [];

  return (data as Row[]).map((row) => ({
    key: str(row.key),
    value: (row.value ?? {}) as Record<string, string>,
  }));
}

/** Raw `settings` rows for the admin editor (same natural-key caveat). */
export async function getSettingsRows(): Promise<
  { key: string; value: Record<string, unknown> }[]
> {
  const client = getReadClient();
  if (!client) return [];

  const { data, error } = await client
    .from("settings")
    .select("key, value")
    .order("key", { ascending: true });
  if (error || !data) return [];

  return (data as Row[]).map((row) => ({
    key: str(row.key),
    value: (row.value ?? {}) as Record<string, unknown>,
  }));
}
