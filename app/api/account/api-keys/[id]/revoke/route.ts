import { getViewer } from "@/lib/billing/entitlement";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { isSameOriginRequest, jsonError, PRIVATE_NO_STORE } from "@/lib/auth/request";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Revokes one of the signed-in user's keys. Authorization is checked in the
 * database on every API request (no cached "valid" state), so a revoked key
 * stops working on its very next request. The row is kept for usage history.
 */
export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!isSameOriginRequest(request)) return jsonError("FORBIDDEN", "Invalid request origin.", 403);

  const viewer = await getViewer();
  if (!viewer) return jsonError("UNAUTHENTICATED", "Please log in to continue.", 401);

  const { id } = await ctx.params;
  if (!UUID.test(id)) return jsonError("NOT_FOUND", "Key not found.", 404);

  const client = getSupabaseServiceRoleClient();
  if (!client) return jsonError("UNAVAILABLE", "Keys can't be changed right now.", 503);

  const { data, error } = await client
    .from("api_keys")
    .update({ revoked_at: new Date().toISOString(), revoked_reason: "user" })
    .eq("id", id)
    .eq("user_id", viewer.userId)
    .is("revoked_at", null)
    .select("id");

  if (error) return jsonError("UNAVAILABLE", "Keys can't be changed right now.", 503);
  if (!data || data.length === 0) return jsonError("NOT_FOUND", "Key not found or already revoked.", 404);

  return Response.json({ success: true }, { headers: PRIVATE_NO_STORE });
}
