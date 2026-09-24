import { getViewer } from "@/lib/billing/entitlement";
import { BillingError, cancelApiSubscription, cancelSubscription } from "@/lib/billing/provider";
import { readRequestedProduct } from "@/lib/billing/request-plan";
import { isSameOriginRequest, jsonError, PRIVATE_NO_STORE } from "@/lib/auth/request";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return jsonError("FORBIDDEN", "Invalid request origin.", 403);

  const viewer = await getViewer();
  if (!viewer) return jsonError("UNAUTHENTICATED", "Please log in to continue.", 401);

  const { product } = await readRequestedProduct(request);

  try {
    if (product === "api") await cancelApiSubscription(viewer.userId);
    else await cancelSubscription(viewer.userId);
    return Response.json({ success: true }, { headers: PRIVATE_NO_STORE });
  } catch (error) {
    if (error instanceof BillingError) return jsonError(error.code, error.message, error.status);
    return jsonError("CANCEL_FAILED", "We couldn't cancel your subscription. Please try again.", 500);
  }
}
