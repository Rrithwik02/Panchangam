import { getEntitlement } from "@/lib/billing/entitlement";
import { BillingError, createProCheckout } from "@/lib/billing/provider";
import { isSameOriginRequest, jsonError, PRIVATE_NO_STORE } from "@/lib/auth/request";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return jsonError("FORBIDDEN", "Invalid request origin.", 403);

  const { viewer, isPro } = await getEntitlement();
  if (!viewer) return jsonError("UNAUTHENTICATED", "Please log in to upgrade.", 401);
  if (isPro) return jsonError("ALREADY_PRO", "You already have Pro.", 409);

  try {
    const checkout = await createProCheckout();
    return Response.json({ success: true, data: checkout }, { headers: PRIVATE_NO_STORE });
  } catch (error) {
    if (error instanceof BillingError) return jsonError(error.code, error.message, error.status);
    return jsonError("CHECKOUT_FAILED", "We couldn't start the payment. Please try again.", 500);
  }
}
