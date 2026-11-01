import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * How long a successful content read is reused before re-fetching. Keeps the
 * site statically rendered (fast, cheap on Netlify) while an admin edit still
 * appears on the live site within a minute.
 */
export const CONTENT_REVALIDATE = 60;

export const MEDIA_BUCKET = "media";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const storageKey = process.env.SUPABASE_STORAGE_KEY;

/** True when the site should read live content instead of the bundled fallback. */
export const isSupabaseConfigured = Boolean(url && anonKey);

/** True when admin content writes are possible. Separate from reads on purpose. */
export const isAdminConfigured = Boolean(url && serviceRoleKey);

/** True when image uploads are possible. */
export const isStorageConfigured = Boolean(url && (storageKey || serviceRoleKey));

/**
 * Newer Supabase projects can issue storage-scoped secret keys. Those can
 * upload but cannot touch table data, so they are kept separate from the
 * service_role key rather than pretending to be the same thing.
 */
function getStorageSecret(): string | undefined {
  return storageKey || serviceRoleKey;
}

/** Lets Next cache these requests so pages stay static. */
const cachedFetch: typeof fetch = (input, init) => {
  const signal = init?.signal ?? AbortSignal.timeout(2500);
  return fetch(input, { ...init, signal, next: { revalidate: CONTENT_REVALIDATE, tags: ["content"] } });
};

const adminFetch: typeof fetch = (input, init) => {
  const signal = init?.signal ?? AbortSignal.timeout(4000);
  return fetch(input, { ...init, signal });
};

/**
 * Reads published content. The anon key carries SELECT-only RLS policies
 * (see supabase/schema.sql), so it cannot modify anything.
 */
export function getReadClient(): SupabaseClient | null {
  if (!url || !anonKey) return null;
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: cachedFetch },
  });
}

/**
 * Reads and writes. The service_role key bypasses RLS completely, so this must
 * never be reachable from a client component -- the "server-only" import above
 * makes that a build error rather than a leaked credential.
 */
export function getAdminClient(): SupabaseClient | null {
  if (!url || !serviceRoleKey) return null;
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: adminFetch },
  });
}

/**
 * Storage writes. Uses the storage-scoped secret when one is configured and
 * falls back to service_role, so image upload keeps working even when table
 * writes are not yet enabled.
 */
export function getStorageClient(): SupabaseClient | null {
  const secret = getStorageSecret();
  if (!url || !secret) return null;
  return createClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Turns a stored path such as "painting/painting-01.jpg" into a public URL.
 * Absolute URLs are passed through so the bundled data/*.ts fallback keeps
 * working before any migration has run.
 */
export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  if (!url) return `/${path}`;
  return `${url}/storage/v1/object/public/${MEDIA_BUCKET}/${path}`;
}

/** mediaUrl over a list, dropping anything that resolved to nothing. */
export function mediaUrls(paths: readonly string[] | null | undefined): string[] {
  if (!paths) return [];
  return paths.map(mediaUrl).filter((p): p is string => Boolean(p));
}
