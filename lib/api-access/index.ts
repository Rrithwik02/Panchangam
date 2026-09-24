import "server-only";

import { createHmac } from "node:crypto";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import {
  databaseCircuitRetryAfterSeconds,
  isDatabaseCircuitOpen,
  recordDatabaseFailure,
  recordDatabaseSuccess,
} from "@/lib/supabase/circuit-breaker";
import { getApiConfig } from "./config";
import type { ApiEndpoint } from "./endpoints";
import { createApiHandler, type ApiAccessStore } from "./handler";

// Binds the API pipeline to Supabase (service role, RPC) for route handlers:
//   export const GET = apiRoute(panchangamDate);

function createSupabaseStore(): ApiAccessStore | null {
  const client = getSupabaseServiceRoleClient();
  if (!client) return null;

  return {
    async authorize(args, signal) {
      const { data, error } = await client.rpc("api_authorize", args).abortSignal(signal);
      if (error) throw new Error("authorize failed");
      return data;
    },
    async finish(args, signal) {
      const { error } = await client.rpc("api_finish", args).abortSignal(signal);
      if (error) throw new Error("finish failed");
    },
  };
}

// IP addresses are only stored as salted hashes. Without an explicit salt, one
// is derived from the server key so hashes stay stable across instances (the
// anomaly check compares them) without ever being reversible from the logs.
function ipHashSalt() {
  const configured = process.env.API_IP_HASH_SALT;
  if (configured) return configured;
  const serverKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || "";
  return createHmac("sha256", serverKey || "panchangam-dev").update("api-ip-hash").digest("hex");
}

let route: ReturnType<typeof createApiHandler> | null = null;

function getRoute() {
  route ??= createApiHandler({
    config: getApiConfig(),
    store: createSupabaseStore(),
    health: {
      isOpen: () => isDatabaseCircuitOpen(),
      retryAfterSeconds: () => databaseCircuitRetryAfterSeconds(),
      success: recordDatabaseSuccess,
      failure: () => recordDatabaseFailure(),
    },
    ipHashSalt: ipHashSalt(),
    logger: (entry) => console.log(JSON.stringify(entry)),
    isProduction: process.env.NODE_ENV === "production",
  });
  return route;
}

export function apiRoute<P>(endpoint: ApiEndpoint<P>) {
  return (request: Request) => getRoute()(endpoint)(request);
}
