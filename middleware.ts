import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Guards /admin and /api/admin.
 *
 * Pages get redirected to the login screen; API routes get a 401 so the browser
 * never sees an HTML login page where it expected JSON. The session token is
 * revalidated against the auth server here and the refreshed cookies are
 * written back, which is what stops users getting randomly logged out.
 */
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const isApi = pathname.startsWith("/api/admin");
  const isLogin = pathname === "/admin/login";

  // Without credentials there is nothing to check against, so let the request
  // through and let the route handlers answer with their own 503. Blocking here
  // would hide the "not configured" message behind a confusing redirect loop.
  if (!url || !key) return NextResponse.next({ request });

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(list) {
        for (const { name, value } of list) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of list) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (isLogin) return response;
    if (isApi) {
      return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    }
    const login = new URL("/admin/login", request.url);
    login.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(login);
  }

  // Already signed in: no reason to show the login form again.
  if (isLogin) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};