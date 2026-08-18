"use client";

import { Sun, Moon, Sunrise, Sunset } from "lucide-react";
import { getMoonPhaseFromTithi } from "@/lib/moon-phase";
import type { PanchangamDay } from "@/lib/types/panchangam";

interface SunMoonSectionProps {
  data: PanchangamDay;
}

export function SunMoonSection({ data }: SunMoonSectionProps) {
  const moonPhase = getMoonPhaseFromTithi(data.tithi, data.paksha);

  return (
    <section id="sun-moon" className="py-12 sm:py-16 border-b border-border/60">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Section Header */}
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">
            Celestial Bodies
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif-title font-semibold text-foreground">
            Sun & Moon Trajectory
          </h2>
        </div>

        {/* Quiet Supporting Card */}
        <div className="rounded-2xl border border-border/70 bg-card p-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {/* Sunrise */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted">
              <Sunrise className="h-4 w-4 text-accent" />
              <span>Sunrise</span>
            </div>
            <p className="text-xl font-semibold tabular-nums text-foreground">{data.sunrise}</p>
          </div>

          {/* Sunset */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted">
              <Sunset className="h-4 w-4 text-accent" />
              <span>Sunset</span>
            </div>
            <p className="text-xl font-semibold tabular-nums text-foreground">{data.sunset}</p>
          </div>

          {/* Moonrise */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted">
              <Moon className="h-4 w-4 text-gold" />
              <span>Moonrise</span>
            </div>
            <p className="text-xl font-semibold tabular-nums text-foreground">{data.moonrise}</p>
          </div>

          {/* Moonset */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted">
              <Moon className="h-4 w-4 text-muted" />
              <span>Moonset</span>
            </div>
            <p className="text-xl font-semibold tabular-nums text-foreground">{data.moonset}</p>
          </div>

          {/* Moon Phase Label */}
          <div className="space-y-1 sm:col-span-2 lg:col-span-1">
            <span className="text-xs text-muted">Lunar Phase</span>
            <p className="text-base font-serif-title font-semibold text-accent">
              {moonPhase.label}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
