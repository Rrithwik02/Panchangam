import Link from "next/link";
import { Lock } from "lucide-react";

/** Shown wherever a Free (or signed-out) visitor reaches a Pro-only feature. */
export function UpgradePrompt({
  title = "50-Year Panchangam",
  message = "Explore Panchangam across the complete historical range.",
  signedIn,
}: {
  title?: string;
  message?: string;
  signedIn: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 text-center shadow-xs space-y-4">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent">
        <Lock className="h-4.5 w-4.5" />
      </div>
      <div className="space-y-1">
        <h3 className="text-xl font-serif-title font-semibold">{title}</h3>
        <p className="text-sm text-muted">{message}</p>
      </div>
      <Link
        href={signedIn ? "/upgrade" : "/login?next=/upgrade"}
        className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-accent px-6 text-sm font-semibold text-white shadow-xs hover:bg-accent-hover"
      >
        Upgrade to Pro — ₹300/month
      </Link>
      {!signedIn && (
        <p className="text-xs text-muted">
          New here?{" "}
          <Link href="/signup?next=/upgrade" className="font-semibold text-accent hover:underline">
            Create a free account
          </Link>
        </p>
      )}
    </div>
  );
}
