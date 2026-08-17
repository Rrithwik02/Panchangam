"use client";

import { PremiumPanchangamView } from "@/components/premium/PremiumPanchangamView";

export function PremiumSection() {
  return (
    <section id="premium" className="py-16 sm:py-24 border-b border-border/60">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-gold">
            Expanded Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif-title font-semibold text-foreground">
            Premium Panchangam
          </h2>
          <p className="text-sm text-muted">
            Explore future dates, custom location coordinates, full Panchangam details, and advanced calendar search.
          </p>
        </div>

        <PremiumPanchangamView />
      </div>
    </section>
  );
}
