"use client";

import { ScrollReveal } from "@/components/ScrollReveal";
import { PanchangamCard } from "@/components/panchangam/PanchangamCard";
import { CelestialScene } from "@/components/celestial/CelestialScene";
import type { PanchangamDay } from "@/lib/types/panchangam";

export function DailyHabitSection({ data }: { data: PanchangamDay }) {
  return (
    <section
      className="relative overflow-hidden border-y border-border bg-card-muted px-4 py-20 sm:px-6 lg:px-8"
      aria-labelledby="habit-heading"
    >
      <div className="absolute inset-0 opacity-30">
        <CelestialScene />
      </div>

      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <ScrollReveal>
          <h2 id="habit-heading" className="text-section-heading font-semibold">
            A better way to start your day.
          </h2>
          <p className="mt-6 text-subheading text-muted">
            Make Panchangam part of your morning routine. Open once, know what&apos;s
            important, and get on with your day.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.12}>
          <div className="rounded-2xl border border-border bg-dark p-1 shadow-xl">
            <PanchangamCard data={data} variant="compact" />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
