// Public Supabase settings, safe for both browser and server. The service-role
// key is deliberately NOT read here — see lib/supabase/service-role.ts.
export function getSupabasePublicConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    "";

  return url && key ? { url, key } : null;
}
