import { FormMessage } from "@/components/auth/AuthUI";
import { AccountSection, ButtonLink, DetailRow, StatusPill } from "@/components/account/AccountUI";
import { describeSubscription, formatDate, requireAccount } from "@/lib/account/data";

const PROVIDER_LABEL = { mock: "Test payment (demo)", razorpay: "Razorpay" } as const;

export default async function BillingPage() {
  const account = await requireAccount("/account/billing");
  const sub = account.subscription;
  const status = describeSubscription(sub, account.isPro);
  const hasPaid = sub?.plan === "pro" && sub.provider;

  return (
    <div>
      {account.loadError && (
        <div className="mb-6">
          <FormMessage tone="error">{account.loadError}</FormMessage>
        </div>
      )}

      <AccountSection title="Billing" description="Payment and access status for your account.">
        {hasPaid ? (
          <dl>
            <DetailRow label="Access" value={<StatusPill tone={status.tone}>{account.isPro ? "Pro access" : "No Pro access"}</StatusPill>} />
            <DetailRow label="Payment method" value={PROVIDER_LABEL[sub.provider!]} />
            {sub.provider_payment_id && (
              <DetailRow label="Last payment" value={<code className="text-xs">{sub.provider_payment_id}</code>} />
            )}
            {sub.current_period_start && <DetailRow label="Period start" value={formatDate(sub.current_period_start)} />}
            {sub.current_period_end && <DetailRow label="Period end" value={formatDate(sub.current_period_end)} />}
          </dl>
        ) : (
          <p className="text-sm text-muted">You&apos;re on the Free plan — there&apos;s nothing to bill.</p>
        )}
        {sub?.status === "payment_failed" && (
          <div className="mt-4">
            <FormMessage tone="error">
              Your last payment failed. Pro features are paused until a payment succeeds.
            </FormMessage>
          </div>
        )}
      </AccountSection>

      {!account.isPro && (
        <AccountSection title="Upgrade">
          <ButtonLink href="/upgrade" variant="primary">
            Upgrade to Pro — ₹300/month
          </ButtonLink>
        </AccountSection>
      )}
    </div>
  );
}
