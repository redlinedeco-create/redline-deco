import "server-only";

import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/supabase/session";
import { getAdminClient, getStorageClient } from "@/lib/supabase/server";

/**
 * Shared guard for every /api/admin route handler.
 *
 * Two separate checks, both mandatory:
 *  1. a valid Supabase Auth session, and
 *  2. the service_role key, which is the only thing that can write.
 *
 * The anon key alone cannot write anything (see the RLS policies in
 * supabase/schema.sql), so a missing service_role key fails closed rather than
 * silently writing with an over-privileged client.
 */
export async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) {
    return {
      error: NextResponse.json(
        { error: "Not signed in." },
        { status: 401 },
      ),
    };
  }

  const db = getAdminClient();
  if (!db) {
    return {
      error: NextResponse.json(
        {
          error:
            "Admin writes are not configured. Add SUPABASE_SERVICE_ROLE_KEY to .env.local and restart.",
        },
        { status: 503 },
      ),
    };
  }

  return { db, user };
}

/**
 * Guard for routes that only touch storage. Image upload works with a
 * storage-scoped secret, so it does not require the full service_role key.
 * Returns a storage client instead of the table client.
 */
export async function requireStorage() {
  const user = await getAdminUser();
  if (!user) {
    return {
      error: NextResponse.json({ error: "Not signed in." }, { status: 401 }),
    };
  }

  const db = getStorageClient();
  if (!db) {
    return {
      error: NextResponse.json(
        {
          error:
            "Image upload is not configured. Add SUPABASE_STORAGE_KEY (or SUPABASE_SERVICE_ROLE_KEY) to .env.local and restart.",
        },
        { status: 503 },
      ),
    };
  }

  return { db, user };
}

/** Turns a Supabase error into a JSON response the client can surface. */
export function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/** Short, readable primary key for newly created rows. */
export function newId(prefix: string) {
  return `${prefix}${crypto.randomUUID().replace(/-/g, "").slice(0, 10)}`;
}

/**
 * Keeps only recognised columns so a payload from the browser can never write
 * to `id`, `created_at` or anything else it should not control. `id` is handled
 * separately by the update paths.
 */
export function pickColumns(
  body: Record<string, unknown>,
  allowed: readonly string[],
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) out[key] = body[key];
  }
  return out;
}

/** jsonb localized columns must be objects; anything else becomes null. */
export function i18nOrNull(value: unknown): Record<string, string> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const o = value as Record<string, unknown>;
  const out: Record<string, string> = {};
  for (const lang of ["en", "fr", "ar"]) {
    out[lang] = typeof o[lang] === "string" ? o[lang] : "";
  }
  return out;
}

/** True when at least one language has real copy. */
export function hasAnyTranslation(value: unknown): boolean {
  const o = i18nOrNull(value);
  if (!o) return false;
  return Object.values(o).some((s) => s.trim().length > 0);
}

/** Coerces to a positive integer, or null when absent/unparseable. */
export function intOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

/** Coerces to a finite number, or null. */
export function numOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/** Empty strings become null so optional columns stay NULL rather than "". */
export function textOrNull(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

/** Normalizes a text[] column, dropping blanks. */
export function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
}