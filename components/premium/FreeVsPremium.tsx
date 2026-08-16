"use client";

import Link from "next/link";
import { AnimatedSection } from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import { freeFeatures, premiumFeatures } from "@/lib/landing-content";
import { Check } from "lucide-react";

export function FreeVsPremium() {
  return (
    <section
      id="premium"
      className="px-4 py-20 sm:px-6 lg:px-8"
      aria-labelledby="premium-heading"
    >
      <div className="mx-auto max-w-6xl">
        <AnimatedSection className="text-center">
          <h2 id="premium-heading" className="text-section-heading font-semibold">
            Start free. Explore more when you need it.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted">
            Today&apos;s Panchangam is free. When you need more, Premium lets you
            explore any date.
          </p>
        </AnimatedSection>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <AnimatedSection delay={0.1}>
            <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-8">
              <div>
                <h3 className="text-xl font-semibold">Free</h3>
                <p className="mt-2 text-3xl font-semibold">₹0</p>
              </div>
              <ul className="mt-8 flex-1 space-y-3">
                {freeFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-8 w-full">
                <Link href="/today">View Today&apos;s Panchangam</Link>
              </Button>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <div className="relative flex h-full flex-col rounded-2xl border border-accent/40 bg-card p-8 shadow-lg shadow-accent/5">
              <div className="absolute -top-3 right-6 rounded-full bg-accent px-3 py-1 text-xs font-medium text-white">
                Premium
              </div>
              <div>
                <h3 className="text-xl font-semibold">Premium</h3>
                <p className="mt-2 text-muted">Unlock every date</p>
              </div>
              <ul className="mt-8 flex-1 space-y-3">
                {premiumFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button asChild variant="secondary" className="mt-8 w-full">
                <Link href="/premium">Explore Premium</Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
