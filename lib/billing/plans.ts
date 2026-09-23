// The only two product states for the website. (API plans are out of scope.)
export type PlanId = "free" | "pro";
export type SubscriptionStatus = "active" | "cancelled" | "expired" | "payment_failed";

export const PLANS = {
  free: { id: "free", name: "Free", priceInr: 0, interval: null },
  pro: { id: "pro", name: "Pro", priceInr: 300, interval: "month" },
} as const;

export const PRO_PERIOD_DAYS = 30;

// Range of dates present in public.daily_panchangam.
export const SUPPORTED_RANGE = { start: "2000-01-01", end: "2047-07-15" } as const;

export function formatPrice(plan: PlanId) {
  const p = PLANS[plan];
  return p.priceInr === 0 ? "₹0" : `₹${p.priceInr}/${p.interval}`;
}
