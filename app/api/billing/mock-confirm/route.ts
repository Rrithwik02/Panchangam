import { getViewer } from "@/lib/billing/entitlement";
import { BillingError, confirmMockApiPayment, confirmMockPayment } from "@/lib/billing/provider";
import { readRequestedProduct } from "@/lib/billing/request-plan";
import { isSameOriginRequest, jsonError, PRIVATE_NO_STORE } from "@/lib/auth/request";

export const dynamic = "force-dynamic";

// Dummy payment provider: stands in for the verified Razorpay webhook until
// Razorpay is integrated. Disabled unless the mock provider is active.
export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return jsonError("FORBIDDEN", "Invalid request origin.", 403);

  const viewer = await getViewer();
  if (!viewer) return jsonError("UNAUTHENTICATED", "Please log in to continue.", 401);

  const { product, body } = await readRequestedProduct(request);
  const checkoutId = typeof body?.checkoutId === "string" ? body.checkoutId : "";
  if (!/^mock_[0-9a-f-]{36}$/.test(checkoutId)) {
    return jsonError("INVALID_CHECKOUT", "This checkout session is not valid.", 400);
  }

  try {
    if (product === "api") await confirmMockApiPayment(viewer.userId, checkoutId);
    else await confirmMockPayment(viewer.userId, checkoutId);
    return Response.json({ success: true }, { headers: PRIVATE_NO_STORE });
  } catch (error) {
    if (error instanceof BillingError) return jsonError(error.code, error.message, error.status);
    return jsonError("PAYMENT_FAILED", "Payment could not be completed. Please try again.", 500);
  }
}
