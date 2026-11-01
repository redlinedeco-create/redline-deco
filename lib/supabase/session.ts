import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const AUTH_COOKIE_PREFIX = "sb-";

/**
 * Builds a cookie-backed Supabase client bound to the current request. Used by
 * pages and route handlers to read the signed-in admin.
 *
 * Every request needs a fresh client: they share cookie state, so a cached one
 * would leak a session between visitors.
 */
async function requestClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const store = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return store.getAll();
      },
      setAll(list) {
        try {
          for (const { name, value, options } of list) {
            store.set(name, value, options);
          }
        } catch {
          // Server Components cannot set cookies. Middleware refreshes the
          // session first, so this is safe to ignore here.
        }
      },
    },
  });
}

/**
 * The signed-in admin, or null. Always revalidates the JWT against the auth
 * server rather than trusting the cookie -- that is what makes it safe to gate
 * writes on.
 */
export async function getAdminUser() {
  const supabase = await requestClient();
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}