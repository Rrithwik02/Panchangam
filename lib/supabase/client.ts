"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicConfig } from "@/lib/supabase/env";

let browserClient: SupabaseClient | null = null;

// Browser-side Supabase client. Sessions are persisted in cookies by
// @supabase/ssr, so the server (proxy, route handlers, server components)
// sees the same session and it survives refreshes and browser restarts.
export function getSupabaseBrowserClient() {
  if (browserClient) return browserClient;

  const config = getSupabasePublicConfig();
  if (!config) return null;

  browserClient = createBrowserClient(config.url, config.key);
  return browserClient;
}
