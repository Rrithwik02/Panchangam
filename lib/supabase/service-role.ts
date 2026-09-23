import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let serviceClient: SupabaseClient | null = null;

// Privileged client used ONLY for server-side writes that users must not be
// able to make themselves (activating/cancelling subscriptions, webhooks).
// Unlike lib/supabase/admin.ts it never falls back to the publishable key:
// without a real service-role/secret key, billing writes are disabled.
export function getSupabaseServiceRoleClient() {
  if (serviceClient) return serviceClient;

  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY ?? "";
  if (!url || !key) return null;

  serviceClient = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
  return serviceClient;
}
