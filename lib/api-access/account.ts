import "server-only";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { hasApiAccess } from "@/lib/billing/access-rules";
import type { SubscriptionStatus } from "@/lib/billing/plans";

// Dashboard reads run as the signed-in user, so RLS limits every query to
// their own rows. Nothing here can see another customer's data or key hashes.

export interface ApiSubscriptionRecord {
  status: SubscriptionStatus;
  provider: "mock" | "razorpay" | null;
  current_period_start: string | null;
  current_period_end: string | null;
}

export interface ApiKeyRecord {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
  revoked_reason: string | null;
}

export interface ApiLogRecord {
  id: number;
  created_at: string;
  key_prefix: string | null;
  endpoint: string;
  status: number;
  error_code: string | null;
  response_ms: number | null;
}

export interface ApiEventRecord {
  id: number;
  created_at: string;
  api_key_id: string | null;
  kind: "suspicious_ip_spread" | "suspicious_country_spread" | "sustained_rate_limiting";
}

export interface ApiDashboard {
  subscription: ApiSubscriptionRecord | null;
  hasAccess: boolean;
  usage: { used: number; periodStart: string | null; periodEnd: string | null };
  keys: ApiKeyRecord[];
  recent: ApiLogRecord[];
  events: ApiEventRecord[];
  loadError: boolean;
}

const EVENT_TEXT: Record<ApiEventRecord["kind"], string> = {
  suspicious_ip_spread: "One of your keys was used from an unusually large number of networks at once.",
  suspicious_country_spread: "One of your keys was used from several countries within a few minutes.",
  sustained_rate_limiting: "One of your keys kept sending requests after being rate limited.",
};

const formatDay = (iso: string) =>
  new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));
const formatMoment = (iso: string) =>
  new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));

/** Dashboard warnings: quota nearly used, plan ending, suspicious use, revoked keys. */
export function apiDashboardWarnings(dashboard: ApiDashboard, quota: number, now = Date.now()): string[] {
  const { subscription: sub, hasAccess } = dashboard;
  const usedPct = Math.round((Math.min(dashboard.usage.used, quota) / quota) * 100);
  const periodEnd = sub?.current_period_end ?? null;
  const daysLeft = periodEnd ? Math.ceil((new Date(periodEnd).getTime() - now) / 86_400_000) : null;
  const warnings: string[] = [];

  if (hasAccess && usedPct >= 100) {
    warnings.push("You've used all of this period's requests. The API will answer 429 until your quota resets.");
  } else if (hasAccess && usedPct >= 80) {
    warnings.push(`You've used ${usedPct}% of this period's requests.`);
  }

  if (hasAccess && sub?.status === "cancelled" && periodEnd) {
    warnings.push(`Your API plan is cancelled. Keys stop working after ${formatDay(periodEnd)}.`);
  } else if (hasAccess && daysLeft !== null && daysLeft <= 5) {
    warnings.push(`Your API plan period ends in ${daysLeft} day${daysLeft === 1 ? "" : "s"}.`);
  }
  if (!hasAccess && sub) warnings.push("Your API plan is not active, so your keys are not accepted right now.");

  for (const event of dashboard.events) {
    warnings.push(
      `${EVENT_TEXT[event.kind]} (${formatMoment(event.created_at)}) If this wasn't you, revoke the key and create a new one.`
    );
  }

  const recentlyRevoked = dashboard.keys.find(
    (k) => k.revoked_at && now - new Date(k.revoked_at).getTime() < 7 * 86_400_000
  );
  if (recentlyRevoked) warnings.push(`Key “${recentlyRevoked.name}” was revoked and no longer works.`);

  return warnings;
}

export async function getApiSubscription(userId: string): Promise<ApiSubscriptionRecord | null> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("api_subscriptions")
    .select("status, provider, current_period_start, current_period_end")
    .eq("user_id", userId)
    .maybeSingle<ApiSubscriptionRecord>();
  return data ?? null;
}

export async function getApiDashboard(userId: string): Promise<ApiDashboard> {
  const supabase = await getSupabaseServerClient();
  const empty: ApiDashboard = {
    subscription: null,
    hasAccess: false,
    usage: { used: 0, periodStart: null, periodEnd: null },
    keys: [],
    recent: [],
    events: [],
    loadError: !supabase,
  };
  if (!supabase) return empty;

  const nowIso = new Date().toISOString();
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [sub, usage, keys, recent, events] = await Promise.all([
    supabase
      .from("api_subscriptions")
      .select("status, provider, current_period_start, current_period_end")
      .eq("user_id", userId)
      .maybeSingle<ApiSubscriptionRecord>(),
    supabase
      .from("api_usage_periods")
      .select("used, period_start, period_end")
      .eq("user_id", userId)
      .lte("period_start", nowIso)
      .gt("period_end", nowIso)
      .order("period_start", { ascending: false })
      .limit(1)
      .maybeSingle<{ used: number; period_start: string; period_end: string }>(),
    supabase
      .from("api_keys")
      .select("id, name, key_prefix, created_at, last_used_at, revoked_at, revoked_reason")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20)
      .returns<ApiKeyRecord[]>(),
    supabase
      .from("api_request_logs")
      .select("id, created_at, key_prefix, endpoint, status, error_code, response_ms")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20)
      .returns<ApiLogRecord[]>(),
    supabase
      .from("api_key_events")
      .select("id, created_at, api_key_id, kind")
      .eq("user_id", userId)
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(10)
      .returns<ApiEventRecord[]>(),
  ]);

  const subscription = sub.data ?? null;
  return {
    subscription,
    hasAccess: hasApiAccess(subscription),
    usage: {
      used: usage.data?.used ?? 0,
      periodStart: usage.data?.period_start ?? subscription?.current_period_start ?? null,
      periodEnd: usage.data?.period_end ?? subscription?.current_period_end ?? null,
    },
    keys: keys.data ?? [],
    recent: recent.data ?? [],
    events: events.data ?? [],
    loadError: Boolean(sub.error || usage.error || keys.error || recent.error || events.error),
  };
}
