import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { UpgradeCheckout } from "@/components/billing/UpgradeCheckout";
import { getEntitlement } from "@/lib/billing/entitlement";
import { SUPPORTED_RANGE } from "@/lib/billing/plans";

export const metadata: Metadata = { title: "Upgrade to Pro — Panchangam" };
export const dynamic = "force-dynamic";

const FEATURES = [
  "Everything in Free — Yesterday & Today in full",
  "Tomorrow's complete Panchangam, not just a preview",
  `Explore any date from ${SUPPORTED_RANGE.start.slice(0, 4)} to ${SUPPORTED_RANGE.end.slice(0, 4)}`,
  "Tithi, Nakshatra, Yoga, Karana, timings & festivals for every day",
];

export default async function UpgradePage() {
  const { viewer, isPro } = await getEntitlement();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main id="main-content" className="flex-1 px-4 py-12 sm:py-16">
        <div className="mx-auto w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">Panchangam Pro</span>
            <h1 className="text-3xl sm:text-4xl font-serif-title font-semibold tracking-tight">
              Explore 50 years of Panchangam
            </h1>
          </div>

          <div className="rounded-2xl border-2 border-accent bg-card p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold tracking-tight">₹300</span>
              <span className="text-sm text-muted">/ month</span>
            </div>
            <ul className="space-y-2.5 text-sm">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            {isPro ? (
              <div className="space-y-3 text-center">
                <p className="text-sm font-medium">You&apos;re already on Pro.</p>
                <Link href="/explore" className="font-semibold text-accent hover:underline text-sm">
                  Open the 50-year explorer →
                </Link>
              </div>
            ) : viewer ? (
              <UpgradeCheckout />
            ) : (
              <div className="space-y-3">
                <Link
                  href="/login?next=/upgrade"
                  className="flex w-full min-h-[46px] items-center justify-center rounded-full bg-accent px-6 text-sm font-semibold text-white hover:bg-accent-hover"
                >
                  Log in to upgrade
                </Link>
                <p className="text-center text-xs text-muted">
                  No account?{" "}
                  <Link href="/signup?next=/upgrade" className="font-semibold text-accent hover:underline">
                    Create one free
                  </Link>
                </p>
              </div>
            )}
          </div>

          <p className="text-center text-xs text-muted">Cancel any time. Pro stays active until the end of the paid month.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
