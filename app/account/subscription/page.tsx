import { FormMessage } from "@/components/auth/AuthUI";
import { AccountSection, ButtonLink, DetailRow, StatusPill } from "@/components/account/AccountUI";
import { CancelSubscriptionButton } from "@/components/account/CancelSubscriptionButton";
import { describeSubscription, formatDate, requireAccount } from "@/lib/account/data";
import { formatPrice, SUPPORTED_RANGE } from "@/lib/billing/plans";

export default async function SubscriptionPage() {
  const account = await requireAccount("/account/subscription");
  const sub = account.subscription;
  const status = describeSubscription(sub, account.isPro);
  const periodEnd = sub?.current_period_end ? formatDate(sub.current_period_end) : null;
  const canCancel = account.isPro && sub?.status === "active";

  return (
    <div>
      {account.loadError && (
        <div className="mb-6">
          <FormMessage tone="error">{account.loadError}</FormMessage>
        </div>
      )}

      <AccountSection title="Subscription">
        <dl>
          <DetailRow label="Plan" value={account.isPro ? "PRO" : "FREE"} />
          <DetailRow label="Price" value={formatPrice(account.isPro ? "pro" : "free")} />
          <DetailRow label="Status" value={<StatusPill tone={status.tone}>{status.label}</StatusPill>} />
          {account.isPro && periodEnd && (
            <DetailRow label={sub?.status === "cancelled" ? "Access until" : "Renews on"} value={periodEnd} />
          )}
        </dl>
        <p className="mt-3 text-sm text-muted">{status.note}</p>
      </AccountSection>

      <AccountSection title="What's included">
        <ul className="space-y-1.5 text-sm text-foreground/90">
          <li>Yesterday and Today — full Panchangam</li>
          <li>Tomorrow — {account.isPro ? "full Panchangam" : "preview (Tithi, Nakshatra, festivals)"}</li>
          <li>
            Explore any date {SUPPORTED_RANGE.start.slice(0, 4)}–{SUPPORTED_RANGE.end.slice(0, 4)} —{" "}
            {account.isPro ? "included" : "Pro only"}
          </li>
        </ul>
      </AccountSection>

      <AccountSection title="Manage">
        <div className="flex flex-wrap gap-3">
          {account.isPro ? (
            <>
              <ButtonLink href="/explore" variant="primary">
                Explore 50 years of Panchangam
              </ButtonLink>
              {canCancel && <CancelSubscriptionButton periodEnd={periodEnd} />}
            </>
          ) : (
            <ButtonLink href="/upgrade" variant="primary">
              {sub?.plan === "pro" ? "Renew Pro" : "Upgrade to Pro"} — {formatPrice("pro")}
            </ButtonLink>
          )}
        </div>
      </AccountSection>
    </div>
  );
}
