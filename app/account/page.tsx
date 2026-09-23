import { FormMessage } from "@/components/auth/AuthUI";
import { AccountSection, ButtonLink, DetailRow, StatusPill } from "@/components/account/AccountUI";
import { LogoutButton } from "@/components/account/LogoutButton";
import { describeSubscription, requireAccount } from "@/lib/account/data";
import { formatPrice } from "@/lib/billing/plans";

export default async function AccountOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ password?: string; upgraded?: string }>;
}) {
  const [account, params] = await Promise.all([requireAccount("/account"), searchParams]);
  const status = describeSubscription(account.subscription, account.isPro);

  return (
    <div>
      {params.password === "updated" && (
        <div className="mb-6">
          <FormMessage tone="success">Your password has been updated.</FormMessage>
        </div>
      )}
      {params.upgraded === "1" && account.isPro && (
        <div className="mb-6">
          <FormMessage tone="success">Welcome to Pro — the 50-year Panchangam is now unlocked.</FormMessage>
        </div>
      )}
      {account.loadError && (
        <div className="mb-6">
          <FormMessage tone="error">{account.loadError}</FormMessage>
        </div>
      )}

      <AccountSection title="Profile">
        <dl>
          <DetailRow label="Name" value={account.profile?.name || <span className="text-muted">Not set</span>} />
          <DetailRow label="Email" value={account.email ?? "—"} />
        </dl>
        <div className="mt-4">
          <ButtonLink href="/account/profile">Edit Profile</ButtonLink>
        </div>
      </AccountSection>

      <AccountSection title="Current Plan">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-2xl font-serif-title font-bold">{account.isPro ? "PRO" : "FREE"}</span>
          <span className="text-sm text-muted">{formatPrice(account.isPro ? "pro" : "free")}</span>
        </div>
        <p className="mt-2 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted">Status:</span>
          <StatusPill tone={status.tone}>{status.label}</StatusPill>
        </p>
        <p className="mt-2 text-sm text-foreground/80">
          {account.isPro ? "50-year Panchangam access · Full Tomorrow Panchangam" : status.note}
        </p>
        {account.isPro && <p className="mt-1 text-xs text-muted">{status.note}</p>}
        <div className="mt-4 flex flex-wrap gap-3">
          {account.isPro ? (
            <ButtonLink href="/account/subscription">Manage Subscription</ButtonLink>
          ) : (
            <ButtonLink href="/upgrade" variant="primary">
              Upgrade to Pro — {formatPrice("pro")}
            </ButtonLink>
          )}
        </div>
      </AccountSection>

      <AccountSection title="Security">
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/account/security">Change Password</ButtonLink>
          <LogoutButton />
        </div>
      </AccountSection>
    </div>
  );
}
