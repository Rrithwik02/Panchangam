// Website plans. The paid API is a separate subscription (API_PLAN below,
// stored in public.api_subscriptions) and does not change Free/Pro.
export type PlanId = "free" | "pro";
export type SubscriptionStatus = "active" | "cancelled" | "expired" | "payment_failed";

export const PLANS = {
  free: { id: "free", name: "Free", priceInr: 0, interval: null },
  pro: { id: "pro", name: "Pro", priceInr: 300, interval: "month" },
} as const;

export const PRO_PERIOD_DAYS = 30;

/** Machine-readable access to the same supported Panchangam dataset as Pro. */
export const API_PLAN = { id: "api", name: "API", priceInr: 600, interval: "month" } as const;
export const API_PERIOD_DAYS = 30;

// Range of dates present in public.daily_panchangam.
export const SUPPORTED_RANGE = { start: "2000-01-01", end: "2047-07-15" } as const;

export function formatPrice(plan: PlanId | "api") {
  const p = plan === "api" ? API_PLAN : PLANS[plan];
  return p.priceInr === 0 ? "₹0" : `₹${p.priceInr}/${p.interval}`;
}
