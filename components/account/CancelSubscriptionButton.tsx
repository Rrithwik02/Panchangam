"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { accountButton } from "@/components/account/AccountUI";
import { FormMessage } from "@/components/auth/AuthUI";
import { useAuth } from "@/components/auth/AuthProvider";

export function CancelSubscriptionButton({
  periodEnd,
  product = "pro",
}: {
  periodEnd: string | null;
  product?: "pro" | "api";
}) {
  const planName = product === "api" ? "the API plan" : "Pro";
  const router = useRouter();
  const { refreshPlan } = useAuth();
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancel = async () => {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: product }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setError(body?.error?.message ?? "We couldn't cancel your subscription. Please try again.");
        return;
      }
      setConfirming(false);
      await refreshPlan();
      router.refresh();
    } catch {
      setError("Network error — please check your connection and try again.");
    } finally {
      setPending(false);
    }
  };

  if (!confirming) {
    return (
      <button type="button" onClick={() => setConfirming(true)} className={accountButton.secondary}>
        Cancel subscription
      </button>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-border bg-card-muted/50 p-4">
      <p className="text-sm">
        Cancel {planName}? You&apos;ll keep access{periodEnd ? ` until ${periodEnd}` : " until the end of this period"}, and
        it won&apos;t renew.
      </p>
      {error && <FormMessage tone="error">{error}</FormMessage>}
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={cancel} disabled={pending} className={accountButton.primary}>
          {pending ? "Cancelling…" : "Yes, cancel"}
        </button>
        <button type="button" onClick={() => setConfirming(false)} className={accountButton.secondary}>
          Keep {product === "api" ? "API plan" : "Pro"}
        </button>
      </div>
    </div>
  );
}
