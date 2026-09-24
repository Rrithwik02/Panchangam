import { getViewer } from "@/lib/billing/entitlement";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { getApiConfig } from "@/lib/api-access/config";
import { generateApiKey } from "@/lib/api-access/keys";
import { WindowCounter } from "@/lib/api-access/memory-limiter";
import { isSameOriginRequest, jsonError, PRIVATE_NO_STORE } from "@/lib/auth/request";

export const dynamic = "force-dynamic";

// Key creation is rare; this stops scripted key churn (per instance).
const creations = new WindowCounter(10, 60 * 60 * 1000);

/**
 * Creates an API key for the signed-in API subscriber. The full secret is in
 * this one response only: the database stores its SHA-256 hash, so it can
 * never be shown again. It is never logged.
 */
export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return jsonError("FORBIDDEN", "Invalid request origin.", 403);

  const viewer = await getViewer();
  if (!viewer) return jsonError("UNAUTHENTICATED", "Please log in to continue.", 401);

  if (creations.hit(viewer.userId)) {
    return jsonError("RATE_LIMITED", "Too many keys created recently. Please try again later.", 429);
  }

  const body = (await request.json().catch(() => null)) as { name?: unknown } | null;
  const name = typeof body?.name === "string" ? body.name.trim().replace(/\s+/g, " ") : "";
  if (!name || name.length > 60 || /[\u0000-\u001f<>]/.test(name)) {
    return jsonError("INVALID_NAME", "Give the key a name of up to 60 characters.", 400);
  }

  const client = getSupabaseServiceRoleClient();
  if (!client) return jsonError("UNAVAILABLE", "API keys can't be created right now.", 503);

  const key = generateApiKey(process.env.NODE_ENV === "production" ? "live" : "test");
  const { data, error } = await client.rpc("api_create_key", {
    p_user_id: viewer.userId,
    p_name: name,
    p_prefix: key.prefix,
    p_hash: key.hash,
    p_max_keys: getApiConfig().maxActiveKeys,
  });

  if (error) return jsonError("UNAVAILABLE", "API keys can't be created right now.", 503);
  const result = data as { ok: boolean; error?: string; id?: string; name?: string; key_prefix?: string; created_at?: string };

  if (!result.ok) {
    if (result.error === "too_many_keys") {
      return jsonError(
        "TOO_MANY_KEYS",
        `You can have up to ${getApiConfig().maxActiveKeys} active keys. Revoke one first.`,
        409
      );
    }
    return jsonError("API_ACCESS_REQUIRED", "An active API subscription is required to create keys.", 403);
  }

  return Response.json(
    {
      success: true,
      data: {
        id: result.id,
        name: result.name,
        key_prefix: result.key_prefix,
        created_at: result.created_at,
        secret: key.secret,
      },
    },
    { headers: PRIVATE_NO_STORE }
  );
}
