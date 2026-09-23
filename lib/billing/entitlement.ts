import "server-only";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { PlanId, SubscriptionStatus } from "@/lib/billing/plans";
import { hasProAccess } from "@/lib/billing/access-rules";

export interface SubscriptionRecord {
  plan: PlanId;
  status: SubscriptionStatus;
  provider: "mock" | "razorpay" | null;
  provider_subscription_id: string | null;
  provider_payment_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface Viewer {
  userId: string;
  email: string | null;
}

export interface Entitlement {
  viewer: Viewer | null;
  subscription: SubscriptionRecord | null;
  isPro: boolean;
  /** True when the subscription couldn't be read (the user is treated as Free). */
  degraded: boolean;
}

/** Current signed-in user, with the session JWT verified by Supabase Auth. */
export async function getViewer(): Promise<Viewer | null> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims?.sub) return null;

  return {
    userId: data.claims.sub,
    email: typeof data.claims.email === "string" ? data.claims.email : null,
  };
}

export async function getEntitlement(): Promise<Entitlement> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { viewer: null, subscription: null, isPro: false, degraded: false };

  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const sub = claimsData?.claims?.sub;
  if (claimsError || !sub) {
    return { viewer: null, subscription: null, isPro: false, degraded: false };
  }

  const viewer: Viewer = {
    userId: sub,
    email: typeof claimsData.claims.email === "string" ? claimsData.claims.email : null,
  };

  // RLS restricts this to the viewer's own row.
  const { data, error } = await supabase
    .from("subscriptions")
    .select(
      "plan, status, provider, provider_subscription_id, provider_payment_id, current_period_start, current_period_end, created_at, updated_at"
    )
    .eq("user_id", viewer.userId)
    .maybeSingle<SubscriptionRecord>();

  if (error) {
    return { viewer, subscription: null, isPro: false, degraded: true };
  }

  return { viewer, subscription: data, isPro: hasProAccess(data), degraded: false };
}
