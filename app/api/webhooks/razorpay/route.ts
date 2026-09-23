import {
  applyRazorpayEvent,
  BillingError,
  verifyRazorpaySignature,
  type RazorpayWebhookEvent,
} from "@/lib/billing/provider";

export const dynamic = "force-dynamic";

// Razorpay → server. The only path (besides the dev-only mock provider) that
// can grant PRO. Dormant until Razorpay is configured.
export async function POST(request: Request) {
  const rawBody = await request.text();

  try {
    if (!verifyRazorpaySignature(rawBody, request.headers.get("x-razorpay-signature"))) {
      return Response.json({ ok: false, error: "invalid_signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody) as RazorpayWebhookEvent;
    const result = await applyRazorpayEvent(event);
    return Response.json({ ok: true, handled: result.handled });
  } catch (error) {
    if (error instanceof BillingError) {
      return Response.json({ ok: false, error: error.code }, { status: error.status });
    }
    return Response.json({ ok: false, error: "bad_request" }, { status: 400 });
  }
}
