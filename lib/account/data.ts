import "server-only";

import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getEntitlement, type SubscriptionRecord } from "@/lib/billing/entitlement";

export interface ProfileRecord {
  user_id: string;
  name: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export interface AccountData {
  userId: string;
  email: string | null;
  profile: ProfileRecord | null;
  subscription: SubscriptionRecord | null;
  isPro: boolean;
  /** Set when profile/subscription couldn't be loaded, so the UI can say so. */
  loadError: string | null;
}

/** Loads the signed-in user's account; redirects to /login when signed out. */
export async function requireAccount(returnTo = "/account"): Promise<AccountData> {
  const { viewer, subscription, isPro, degraded } = await getEntitlement();
  if (!viewer) redirect(`/login?next=${encodeURIComponent(returnTo)}`);

  const supabase = await getSupabaseServerClient();
  const { data: profile, error } = supabase
    ? await supabase
        .from("profiles")
        .select("user_id, name, email, created_at, updated_at")
        .eq("user_id", viewer.userId)
        .maybeSingle<ProfileRecord>()
    : { data: null, error: new Error("unavailable") };

  return {
    userId: viewer.userId,
    email: profile?.email ?? viewer.email,
    profile,
    subscription,
    isPro,
    loadError:
      error || degraded
        ? "We couldn't load all of your account details right now. Please refresh in a moment."
        : null,
  };
}

export type StatusTone = "good" | "warn" | "neutral";

export function describeSubscription(sub: SubscriptionRecord | null, isPro: boolean) {
  const endLabel = sub?.current_period_end ? formatDate(sub.current_period_end) : null;

  if (!sub || sub.plan === "free") {
    return { label: "Active", tone: "neutral" as StatusTone, note: "Free plan — Yesterday, Today and a Tomorrow preview." };
  }

  switch (sub.status) {
    case "active":
      return isPro
        ? { label: "Active", tone: "good" as StatusTone, note: endLabel ? `Renews on ${endLabel}.` : "Active." }
        : { label: "Expired", tone: "warn" as StatusTone, note: `Your Pro period ended${endLabel ? ` on ${endLabel}` : ""}.` };
    case "cancelled":
      return isPro
        ? { label: "Cancelled", tone: "warn" as StatusTone, note: `Pro stays available until ${endLabel}. It won't renew.` }
        : { label: "Cancelled", tone: "warn" as StatusTone, note: "Your Pro subscription was cancelled and has ended." };
    case "payment_failed":
      return { label: "Payment failed", tone: "warn" as StatusTone, note: "Your last payment didn't go through. Please update your payment to restore Pro." };
    case "expired":
      return { label: "Expired", tone: "warn" as StatusTone, note: "Your Pro subscription has expired." };
  }
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));
}
