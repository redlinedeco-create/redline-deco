"use client";

import { createBrowserClient } from "@supabase/ssr";

let cached: ReturnType<typeof createBrowserClient> | null = null;

/**
 * Browser client used only for signing in and out. The anon/publishable key is
 * safe to expose: RLS keeps it to SELECT-only, and every write goes through the
 * authenticated /api/admin route handlers.
 *
 * Returns null when the project URL or key is missing, so callers can show a
 * "not configured" message instead of throwing.
 */
export function getBrowserAuthClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  if (!cached) {
    cached = createBrowserClient(url, key, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
  }
  return cached;
}