import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let adminClient: SupabaseClient | null = null;

function getSupabaseUrl() {
  return process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
}

// Server key only. There is deliberately no fallback to the publishable key:
// Panchangam data is not readable with it (RLS/grants), and a missing server
// key must surface as "unavailable" rather than as a silently weaker client.
function getSupabaseKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY ?? "";
}

export function isSupabaseUrlConfigured() {
  return Boolean(getSupabaseUrl());
}

/**
 * Server-side client for reading Panchangam data. One instance is reused for
 * the life of the server process/instance; supabase-js talks to PostgREST over
 * HTTP (fetch keep-alive), so there is no database connection to leak.
 */
export function getSupabaseAdminClient() {
  if (adminClient) {
    return adminClient;
  }

  const url = getSupabaseUrl();
  const key = getSupabaseKey();

  if (!url || !key) {
    return null;
  }

  adminClient = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  return adminClient;
}
