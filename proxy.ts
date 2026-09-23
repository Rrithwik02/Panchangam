import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabasePublicConfig } from "@/lib/supabase/env";
import { isGuestOnlyPath, isProtectedPath } from "@/lib/auth/redirect";

// Refreshes the Supabase session cookie on every page request (so users stay
// signed in across refreshes and browser restarts) and does optimistic
// redirects for account/auth pages. Real authorization happens server-side in
// the pages and route handlers themselves.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const config = getSupabasePublicConfig();
  if (!config) return response;

  const supabase = createServerClient(config.url, config.key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
        Object.entries(headers ?? {}).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });

  // Must run before any redirect decision: validates and, if needed,
  // refreshes the session and writes the new cookies onto `response`.
  const { data } = await supabase.auth.getClaims();
  const isSignedIn = Boolean(data?.claims?.sub);
  const { pathname, search } = request.nextUrl;

  if (!isSignedIn && isProtectedPath(pathname)) {
    return redirectPreservingCookies(request, response, "/login", `${pathname}${search}`);
  }

  if (isSignedIn && isGuestOnlyPath(pathname)) {
    return redirectPreservingCookies(request, response, "/account");
  }

  return response;
}

function redirectPreservingCookies(
  request: NextRequest,
  source: NextResponse,
  target: string,
  next?: string
) {
  const url = request.nextUrl.clone();
  url.pathname = target;
  url.search = next ? `?next=${encodeURIComponent(next)}` : "";
  const redirect = NextResponse.redirect(url);
  source.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}

export const config = {
  matcher: [
    // Skip static assets, the public v1 API (unchanged, keyless) and webhooks.
    "/((?!_next/static|_next/image|favicon.ico|api/v1|api/openapi|api/webhooks|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
