import Link from "next/link";
import { FormMessage } from "@/components/auth/AuthUI";
import { AccountSection, DetailRow, StatusPill } from "@/components/account/AccountUI";
import { ApiKeysManager } from "@/components/account/ApiKeysManager";
import { CancelSubscriptionButton } from "@/components/account/CancelSubscriptionButton";
import { UpgradeCheckout } from "@/components/billing/UpgradeCheckout";
import { formatDate, requireAccount } from "@/lib/account/data";
import { apiDashboardWarnings, getApiDashboard } from "@/lib/api-access/account";
import { getApiConfig } from "@/lib/api-access/config";
import { formatPrice, SUPPORTED_RANGE } from "@/lib/billing/plans";

const formatTime = (iso: string) =>
  new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "medium" }).format(new Date(iso));

export default async function ApiAccountPage({
  searchParams,
}: {
  searchParams: Promise<{ subscribed?: string }>;
}) {
  const [account, params] = await Promise.all([requireAccount("/account/api"), searchParams]);
  const dashboard = await getApiDashboard(account.userId);
  const config = getApiConfig();

  const sub = dashboard.subscription;
  const quota = config.monthlyQuota;
  const used = Math.min(dashboard.usage.used, quota);
  const remaining = Math.max(0, quota - used);
  const usedPct = Math.round((used / quota) * 100);
  const activeKeys = dashboard.keys.filter((k) => !k.revoked_at).length;
  const periodEnd = sub?.current_period_end ? formatDate(sub.current_period_end) : null;
  const warnings = apiDashboardWarnings(dashboard, quota);

  return (
    <div>
      {params.subscribed === "1" && dashboard.hasAccess && (
        <div className="mb-6">
          <FormMessage tone="success">Your API plan is active. Create a key below to start.</FormMessage>
        </div>
      )}
      {dashboard.loadError && (
        <div className="mb-6">
          <FormMessage tone="error">We couldn&apos;t load all of your API details right now. Please refresh in a moment.</FormMessage>
        </div>
      )}
      {warnings.length > 0 && (
        <div className="mb-6 space-y-2">
          {warnings.map((w) => (
            <div key={w} role="status" className="rounded-xl border border-accent/30 bg-accent/10 px-3.5 py-3 text-sm">
              {w}
            </div>
          ))}
        </div>
      )}

      <AccountSection title="API plan" description="Machine-readable access to the same Panchangam data as Pro.">
        <dl>
          <DetailRow label="Plan" value="API" />
          <DetailRow label="Price" value={formatPrice("api")} />
          <DetailRow
            label="Status"
            value={
              dashboard.hasAccess ? (
                <StatusPill tone={sub?.status === "cancelled" ? "warn" : "good"}>
                  {sub?.status === "cancelled" ? "Cancelled" : "Active"}
                </StatusPill>
              ) : (
                <StatusPill tone={sub ? "warn" : "neutral"}>{sub ? "Inactive" : "Not subscribed"}</StatusPill>
              )
            }
          />
          {dashboard.hasAccess && periodEnd && (
            <DetailRow label={sub?.status === "cancelled" ? "Access until" : "Renews on"} value={periodEnd} />
          )}
          <DetailRow label="Dataset" value={`${SUPPORTED_RANGE.start} to ${SUPPORTED_RANGE.end}`} />
        </dl>
        <div className="mt-4 flex flex-wrap gap-3">
          {!dashboard.hasAccess ? (
            <div className="w-full max-w-md">
              <UpgradeCheckout product="api" />
            </div>
          ) : (
            sub?.status === "active" && <CancelSubscriptionButton product="api" periodEnd={periodEnd} />
          )}
        </div>
      </AccountSection>

      <AccountSection title="Usage this period">
        <dl>
          <DetailRow label="Monthly quota" value={`${quota.toLocaleString("en-IN")} requests`} />
          <DetailRow label="Used" value={used.toLocaleString("en-IN")} />
          <DetailRow label="Remaining" value={remaining.toLocaleString("en-IN")} />
          <DetailRow label="Rate limit" value={`${config.ratePerMinute} requests/minute per key`} />
          <DetailRow label="Burst" value={`${config.burstPerSecond} requests/second per key`} />
          <DetailRow label="Concurrency" value={`${config.maxConcurrent} simultaneous requests per key`} />
          <DetailRow label="API keys" value={`${activeKeys} active (max ${config.maxActiveKeys})`} />
        </dl>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-card-muted" aria-hidden="true">
          <div className="h-full rounded-full bg-accent" style={{ width: `${Math.min(100, usedPct)}%` }} />
        </div>
        <p className="mt-3 text-xs text-muted">
          Every successful request counts, including ones served from our cache. Invalid keys, invalid
          parameters, inactive subscriptions, rate-limited and failed requests don&apos;t count.
        </p>
      </AccountSection>

      <AccountSection
        title="API keys"
        description="Send a key as Authorization: Bearer <API_KEY>. Keep keys on your server — never in a browser, app bundle or URL."
      >
        <ApiKeysManager keys={dashboard.keys} canCreate={dashboard.hasAccess} maxActiveKeys={config.maxActiveKeys} />
      </AccountSection>

      <AccountSection title="Recent activity">
        {dashboard.recent.length === 0 ? (
          <p className="text-sm text-muted">No API requests yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="py-2 pr-4 font-semibold">Time</th>
                  <th className="py-2 pr-4 font-semibold">Endpoint</th>
                  <th className="py-2 pr-4 font-semibold">Status</th>
                  <th className="py-2 pr-4 font-semibold">Response time</th>
                  <th className="py-2 font-semibold">Key</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {dashboard.recent.map((row) => (
                  <tr key={row.id}>
                    <td className="py-2 pr-4 whitespace-nowrap">{formatTime(row.created_at)}</td>
                    <td className="py-2 pr-4 font-mono text-xs">{row.endpoint}</td>
                    <td className="py-2 pr-4">
                      {row.status}
                      {row.error_code ? <span className="text-muted"> · {row.error_code}</span> : null}
                    </td>
                    <td className="py-2 pr-4">{row.response_ms !== null ? `${row.response_ms} ms` : "—"}</td>
                    <td className="py-2 font-mono text-xs text-muted">{row.key_prefix ? `${row.key_prefix}…` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-4 text-sm">
          <Link href="/docs" className="font-medium text-accent underline">
            API documentation
          </Link>
        </p>
      </AccountSection>
    </div>
  );
}
