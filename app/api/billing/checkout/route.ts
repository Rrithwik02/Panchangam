import { getEntitlement } from "@/lib/billing/entitlement";
import { BillingError, createCheckout } from "@/lib/billing/provider";
import { readRequestedProduct } from "@/lib/billing/request-plan";
import { getApiSubscription } from "@/lib/api-access/account";
import { hasApiAccess } from "@/lib/billing/access-rules";
import { isSameOriginRequest, jsonError, PRIVATE_NO_STORE } from "@/lib/auth/request";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return jsonError("FORBIDDEN", "Invalid request origin.", 403);

  const { product } = await readRequestedProduct(request);
  const { viewer, isPro } = await getEntitlement();
  if (!viewer) return jsonError("UNAUTHENTICATED", "Please log in to upgrade.", 401);

  if (product === "pro" && isPro) return jsonError("ALREADY_PRO", "You already have Pro.", 409);
  if (product === "api") {
    const apiSub = await getApiSubscription(viewer.userId);
    if (hasApiAccess(apiSub)) return jsonError("ALREADY_SUBSCRIBED", "You already have the API plan.", 409);
  }

  try {
    const checkout = await createCheckout(product);
    return Response.json({ success: true, data: checkout }, { headers: PRIVATE_NO_STORE });
  } catch (error) {
    if (error instanceof BillingError) return jsonError(error.code, error.message, error.status);
    return jsonError("CHECKOUT_FAILED", "We couldn't start the payment. Please try again.", 500);
  }
}
