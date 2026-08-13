import Link from "next/link";
import { Button } from "@/components/ui/button";
import { premiumFeatures } from "@/lib/mock-panchangam";
import { Check } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Premium — Panchangam",
  description:
    "Unlock complete Panchangam for any date with Premium. Calendar navigation, finders, and multiple locations.",
};

export default function PremiumPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="font-semibold">
            ← Panchangam
          </Link>
          <Button asChild size="sm">
            <Link href="/today">View Today&apos;s Panchangam</Link>
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold">Premium</h1>
        <p className="mt-2 text-muted">Unlock every date. Explore without limits.</p>

        <ul className="mt-10 space-y-4">
          {premiumFeatures.map((feature) => (
            <li key={feature} className="flex items-start gap-3">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <div className="mt-12 rounded-2xl border border-border bg-card p-8 text-center">
          <p className="text-lg font-medium">Subscription coming soon</p>
          <p className="mt-2 text-sm text-muted">
            Premium is not yet available. Start with today&apos;s free Panchangam
            while we prepare the full experience.
          </p>
          <Button asChild className="mt-6">
            <Link href="/today">View Today&apos;s Panchangam</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
