"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { FormMessage } from "@/components/auth/AuthUI";

type Checkout = { provider: "mock" | "razorpay"; checkoutId: string; amountInr: number };

export function UpgradeCheckout() {
  const router = useRouter();
  const { refreshPlan } = useAuth();
  const [checkout, setCheckout] = useState<Checkout | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<"start" | "pay" | null>(null);

  const start = async () => {
    setPending("start");
    setError(null);
    try {
      const res = await fetch("/api/billing/checkout", { method: "POST" });
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.success) {
        if (body?.error?.code === "ALREADY_PRO") {
          router.replace("/account/subscription");
          return;
        }
        setError(body?.error?.message ?? "We couldn't start the payment. Please try again.");
        return;
      }
      setCheckout(body.data as Checkout);
    } catch {
      setError("Network error — please check your connection and try again.");
    } finally {
      setPending(null);
    }
  };

  const payMock = async () => {
    if (!checkout) return;
    setPending("pay");
    setError(null);
    try {
      // The server records the payment and activates Pro; this page never does.
      const res = await fetch("/api/billing/mock-confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkoutId: checkout.checkoutId }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.success) {
        setError(body?.error?.message ?? "Payment could not be completed. Please try again.");
        return;
      }
      await refreshPlan();
      router.replace("/account?upgraded=1");
      router.refresh();
    } catch {
      setError("Network error — your payment was not completed. Please try again.");
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="space-y-4">
      {error && <FormMessage tone="error">{error}</FormMessage>}

      {!checkout ? (
        <button
          type="button"
          onClick={start}
          disabled={pending !== null}
          className="w-full min-h-[46px] rounded-full bg-accent px-6 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {pending === "start" ? "Starting checkout…" : "Upgrade to Pro — ₹300/month"}
        </button>
      ) : (
        <div className="space-y-4 rounded-xl border border-dashed border-accent/40 bg-accent/5 p-5">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">Test checkout</p>
            <p className="text-sm text-foreground/90">
              Payments are in demo mode while Razorpay is being connected. No real money is charged.
            </p>
          </div>
          <div className="flex items-baseline justify-between border-t border-border/60 pt-3 text-sm">
            <span className="text-muted">Pro · monthly</span>
            <span className="font-semibold">₹{checkout.amountInr}.00</span>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={payMock}
              disabled={pending !== null}
              className="flex-1 min-h-[44px] rounded-full bg-accent px-6 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-60"
            >
              {pending === "pay" ? "Processing…" : `Pay ₹${checkout.amountInr} (test)`}
            </button>
            <button
              type="button"
              onClick={() => {
                setCheckout(null);
                setError("Payment was cancelled. You have not been charged.");
              }}
              disabled={pending !== null}
              className="min-h-[44px] rounded-full border border-border bg-card px-6 text-sm font-semibold hover:bg-card-muted"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
