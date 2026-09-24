import "server-only";

import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import {
  API_PERIOD_DAYS,
  API_PLAN,
  PLANS,
  PRO_PERIOD_DAYS,
  type SubscriptionStatus,
} from "@/lib/billing/plans";

export type BillingProviderId = "mock" | "razorpay";

export class BillingError extends Error {
  constructor(
    public code:
      | "BILLING_NOT_CONFIGURED"
      | "PROVIDER_UNAVAILABLE"
      | "INVALID_SIGNATURE"
      | "DATABASE_ERROR",
    message: string,
    public status = 500
  ) {
    super(message);
  }
}

/**
 * Active payment provider.
 * - "mock": dummy checkout. On by default in development; in production it
 *   must be enabled explicitly with BILLING_PROVIDER=mock.
 * - "razorpay": placeholder until the Razorpay integration is added.
 */
export function getBillingProvider(): BillingProviderId | null {
  const configured = process.env.BILLING_PROVIDER?.toLowerCase();
  if (configured === "razorpay") return "razorpay";
  if (configured === "mock") return "mock";
  return process.env.NODE_ENV === "production" ? null : "mock";
}

function requireServiceClient() {
  const client = getSupabaseServiceRoleClient();
  if (!client) {
    throw new BillingError(
      "BILLING_NOT_CONFIGURED",
      "Payments aren't configured on the server yet. Please try again later.",
      503
    );
  }
  return client;
}

export interface CheckoutSession {
  provider: BillingProviderId;
  checkoutId: string;
  amountInr: number;
}

export type PaidProduct = "pro" | "api";

export async function createCheckout(product: PaidProduct): Promise<CheckoutSession> {
  const provider = getBillingProvider();
  const amountInr = product === "api" ? API_PLAN.priceInr : PLANS.pro.priceInr;

  if (provider === "mock") {
    requireServiceClient();
    return { provider, checkoutId: `mock_${randomUUID()}`, amountInr };
  }

  if (provider === "razorpay") {
    // TODO(razorpay): create a Razorpay subscription for RAZORPAY_PLAN_ID with
    // notes.user_id = <user id> and return its id for the Checkout modal.
    // PRO is activated only by the verified webhook, never by the modal.
    throw new BillingError(
      "PROVIDER_UNAVAILABLE",
      "Online payments are coming soon. Please check back shortly.",
      503
    );
  }

  throw new BillingError("BILLING_NOT_CONFIGURED", "Payments aren't available right now.", 503);
}

/** Mock provider only: the server records a successful payment and activates PRO. */
export async function confirmMockPayment(userId: string, checkoutId: string) {
  if (getBillingProvider() !== "mock") {
    throw new BillingError("PROVIDER_UNAVAILABLE", "Test payments are disabled.", 403);
  }

  const now = new Date();
  const end = new Date(now.getTime() + PRO_PERIOD_DAYS * 24 * 60 * 60 * 1000);

  await writeSubscription(userId, {
    plan: "pro",
    status: "active",
    provider: "mock",
    provider_subscription_id: checkoutId,
    provider_payment_id: `mock_pay_${randomUUID()}`,
    current_period_start: now.toISOString(),
    current_period_end: end.toISOString(),
  });
}

/**
 * Cancel at period end: PRO stays available until current_period_end, after
 * which hasProAccess() turns it off. With Razorpay this would call its cancel
 * API and let the webhook confirm the change.
 */
export async function cancelSubscription(userId: string) {
  if (getBillingProvider() === "razorpay") {
    throw new BillingError("PROVIDER_UNAVAILABLE", "Subscription management is coming soon.", 503);
  }

  const client = requireServiceClient();
  const { error } = await client
    .from("subscriptions")
    .update({ status: "cancelled" })
    .eq("user_id", userId)
    .eq("plan", "pro")
    .eq("status", "active");

  if (error) throw new BillingError("DATABASE_ERROR", "Couldn't update your subscription.");
}

/** Mock provider only: activates (or renews) the API subscription for 30 days. */
export async function confirmMockApiPayment(userId: string, checkoutId: string) {
  if (getBillingProvider() !== "mock") {
    throw new BillingError("PROVIDER_UNAVAILABLE", "Test payments are disabled.", 403);
  }

  const now = new Date();
  const end = new Date(now.getTime() + API_PERIOD_DAYS * 24 * 60 * 60 * 1000);
  const client = requireServiceClient();
  const { error } = await client.from("api_subscriptions").upsert(
    {
      user_id: userId,
      status: "active",
      provider: "mock",
      provider_subscription_id: checkoutId,
      provider_payment_id: `mock_pay_${randomUUID()}`,
      current_period_start: now.toISOString(),
      current_period_end: end.toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) throw new BillingError("DATABASE_ERROR", "Couldn't update your API subscription.");
}

/**
 * Cancel at period end. API keys keep working until current_period_end and
 * then stop authenticating (the entitlement check fails) — they are not
 * deleted, so usage history stays intact.
 */
export async function cancelApiSubscription(userId: string) {
  if (getBillingProvider() === "razorpay") {
    throw new BillingError("PROVIDER_UNAVAILABLE", "Subscription management is coming soon.", 503);
  }

  const client = requireServiceClient();
  const { error } = await client
    .from("api_subscriptions")
    .update({ status: "cancelled" })
    .eq("user_id", userId)
    .eq("status", "active");

  if (error) throw new BillingError("DATABASE_ERROR", "Couldn't update your API subscription.");
}

type SubscriptionWrite = {
  plan: "free" | "pro";
  status: SubscriptionStatus;
  provider?: BillingProviderId | null;
  provider_subscription_id?: string | null;
  provider_payment_id?: string | null;
  current_period_start?: string | null;
  current_period_end?: string | null;
};

async function writeSubscription(userId: string, values: SubscriptionWrite) {
  const client = requireServiceClient();
  const { error } = await client
    .from("subscriptions")
    .upsert({ user_id: userId, ...values }, { onConflict: "user_id" });

  if (error) throw new BillingError("DATABASE_ERROR", "Couldn't update your subscription.");
}

// ---------------------------------------------------------------------------
// Razorpay webhooks (dormant until BILLING_PROVIDER=razorpay)
// ---------------------------------------------------------------------------

export function verifyRazorpaySignature(rawBody: string, signature: string | null) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    throw new BillingError("BILLING_NOT_CONFIGURED", "Webhook secret is not configured.", 503);
  }
  if (!signature) return false;

  const expected = Buffer.from(createHmac("sha256", secret).update(rawBody).digest("hex"));
  const received = Buffer.from(signature);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

interface RazorpaySubscriptionEntity {
  id: string;
  current_start?: number | null;
  current_end?: number | null;
  notes?: Record<string, string> | null;
}

export interface RazorpayWebhookEvent {
  event: string;
  payload?: {
    subscription?: { entity?: RazorpaySubscriptionEntity };
    payment?: { entity?: { id?: string } };
  };
}

const EVENT_STATUS: Record<string, SubscriptionStatus> = {
  "subscription.activated": "active",
  "subscription.charged": "active", // payment succeeded / renewal
  "subscription.resumed": "active",
  "subscription.pending": "payment_failed",
  "subscription.halted": "payment_failed",
  "payment.failed": "payment_failed",
  "subscription.cancelled": "cancelled",
  "subscription.completed": "expired",
  "subscription.expired": "expired",
};

const toIso = (unix?: number | null) => (unix ? new Date(unix * 1000).toISOString() : null);

/** Applies a signature-verified Razorpay event to the subscriptions table. */
export async function applyRazorpayEvent(event: RazorpayWebhookEvent) {
  const status = EVENT_STATUS[event.event];
  const sub = event.payload?.subscription?.entity;
  if (!status || !sub?.id) return { handled: false };

  const client = requireServiceClient();
  const values: SubscriptionWrite = {
    plan: "pro",
    status,
    provider: "razorpay",
    provider_subscription_id: sub.id,
    ...(event.payload?.payment?.entity?.id
      ? { provider_payment_id: event.payload.payment.entity.id }
      : {}),
    ...(sub.current_start ? { current_period_start: toIso(sub.current_start) } : {}),
    ...(sub.current_end ? { current_period_end: toIso(sub.current_end) } : {}),
  };

  const { data, error } = await client
    .from("subscriptions")
    .update(values)
    .eq("provider_subscription_id", sub.id)
    .select("user_id");

  if (error) throw new BillingError("DATABASE_ERROR", "Couldn't update subscription.");

  // First event for a new subscription: link it to the user via notes.user_id,
  // which our server sets when creating the Razorpay subscription.
  if ((!data || data.length === 0) && sub.notes?.user_id) {
    await writeSubscription(sub.notes.user_id, values);
  }

  return { handled: true };
}
