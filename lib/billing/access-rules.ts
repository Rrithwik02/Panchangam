import type { PlanId, SubscriptionStatus } from "./plans";

export interface SubscriptionAccessFields {
  plan: PlanId;
  status: SubscriptionStatus;
  current_period_end: string | null;
}

/**
 * Shared paid-access rule (mirrored by public.api_is_entitled in SQL):
 * - status = active, not past its period end (or open-ended), or
 * - status = cancelled, but still inside the paid period.
 * expired / payment_failed never have access.
 */
export function isPaidPeriodActive(
  status: SubscriptionStatus,
  currentPeriodEnd: string | null,
  now = new Date()
) {
  const periodEnd = currentPeriodEnd ? new Date(currentPeriodEnd) : null;
  const withinPeriod = periodEnd ? periodEnd.getTime() > now.getTime() : false;

  if (status === "active") return periodEnd ? withinPeriod : true;
  if (status === "cancelled") return withinPeriod;
  return false;
}

/**
 * PRO access comes only from the subscriptions row in the database — never
 * from client state, localStorage, URL parameters or hidden UI.
 */
export function hasProAccess(sub: SubscriptionAccessFields | null, now = new Date()) {
  if (!sub || sub.plan !== "pro") return false;
  return isPaidPeriodActive(sub.status, sub.current_period_end, now);
}

/** API access comes only from the api_subscriptions row (Pro does not include it). */
export function hasApiAccess(
  sub: { status: SubscriptionStatus; current_period_end: string | null } | null,
  now = new Date()
) {
  if (!sub) return false;
  return isPaidPeriodActive(sub.status, sub.current_period_end, now);
}
