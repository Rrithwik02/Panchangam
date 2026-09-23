import { getEntitlement } from "@/lib/billing/entitlement";
import { PRIVATE_NO_STORE } from "@/lib/auth/request";

export const dynamic = "force-dynamic";

// The signed-in viewer's plan, for display only. Every Pro-gated response is
// re-checked on the server; nothing trusts this value coming back.
export async function GET() {
  const { viewer, subscription, isPro } = await getEntitlement();

  return Response.json(
    {
      signedIn: Boolean(viewer),
      plan: isPro ? "pro" : "free",
      status: subscription?.status ?? null,
      currentPeriodEnd: subscription?.current_period_end ?? null,
    },
    { headers: PRIVATE_NO_STORE }
  );
}
