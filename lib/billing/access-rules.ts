import type { PlanId, SubscriptionStatus } from "./plans";

export interface SubscriptionAccessFields {
  plan: PlanId;
  status: SubscriptionStatus;
  current_period_end: string | null;
}

/**
 * PRO access comes only from the subscriptions row in the database:
 * - plan = pro and status = active (and not past its period end), or
 * - plan = pro and status = cancelled but still inside the paid period.
 * Never from client state, localStorage, URL parameters or hidden UI.
 */
export function hasProAccess(sub: SubscriptionAccessFields | null, now = new Date()) {
  if (!sub || sub.plan !== "pro") return false;

  const periodEnd = sub.current_period_end ? new Date(sub.current_period_end) : null;
  const withinPeriod = periodEnd ? periodEnd.getTime() > now.getTime() : false;

  if (sub.status === "active") return periodEnd ? withinPeriod : true;
  if (sub.status === "cancelled") return withinPeriod;
  return false;
}
