"use client";

import { ExplorePanchangamView } from "@/components/explore/ExplorePanchangamView";

export function ExploreSection() {
  return (
    <section id="explore" className="py-16 sm:py-24 border-b border-border/60">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">
            Directory & Search
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif-title font-semibold text-foreground">
            Explore Panchangam
          </h2>
          <p className="text-sm text-muted">
            Directory of Tithis, Nakshatras, Festivals, and Panchangam search capabilities.
          </p>
        </div>

        <ExplorePanchangamView />
      </div>
    </section>
  );
}
