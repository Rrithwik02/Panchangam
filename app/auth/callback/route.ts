import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/auth/redirect";

export const dynamic = "force-dynamic";

// Landing point for Supabase email links (signup confirmation, password
// recovery) and, later, Google OAuth. Exchanges the one-time code for a
// cookie session and continues to ?next=.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = safeNextPath(url.searchParams.get("next"), "/account");
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;

  const fail = (reason: string) => {
    const target = next === "/reset-password" ? "/forgot-password" : "/login";
    return NextResponse.redirect(new URL(`${target}?error=${reason}`, url.origin));
  };

  if (url.searchParams.get("error")) return fail("link_invalid");

  const supabase = await getSupabaseServerClient();
  if (!supabase) return fail("auth_unavailable");

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return fail("link_invalid");
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (error) return fail("link_invalid");
  } else {
    return fail("link_invalid");
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
