"use client";

import { ScrollReveal } from "@/components/ScrollReveal";
import { PanchangamCard } from "@/components/panchangam/PanchangamCard";
import { CelestialScene } from "@/components/celestial/CelestialScene";
import { todaysPanchangam } from "@/lib/mock-panchangam";

export function DailyHabitSection() {
  return (
    <section
      className="relative overflow-hidden bg-dark px-4 py-20 sm:px-6 lg:px-8"
      aria-labelledby="habit-heading"
    >
      <div className="absolute inset-0 opacity-40">
        <CelestialScene />
      </div>

      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <ScrollReveal>
          <h2 id="habit-heading" className="text-section-heading font-semibold text-white">
            A better way to start your day.
          </h2>
          <p className="mt-6 text-subheading text-white/70">
            Make Panchangam part of your morning routine. Open once, know what&apos;s
            important, and get on with your day.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.12}>
          <PanchangamCard data={todaysPanchangam} variant="compact" />
        </ScrollReveal>
      </div>
    </section>
  );
}
