"use client";

import { Sun, Moon, Lock } from "lucide-react";
import type { PanchangamDay, PanchangamPreviewDay } from "@/lib/types/panchangam";

interface SunMoonSectionProps {
  data: PanchangamDay | PanchangamPreviewDay;
}

export function SunMoonSection({ data }: SunMoonSectionProps) {
  const isPreview = "access" in data && data.access === "preview";
  const fullData = isPreview ? null : (data as PanchangamDay);

  const scrollToPremium = () => {
    document.getElementById("premium")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="sun-moon" className="py-16 sm:py-20 border-b border-border/60">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="border-b border-border/70 pb-4 space-y-1">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">
            Celestial Trajectory
          </span>
          <h2 className="text-3xl font-serif-title font-semibold text-foreground">
            Sun & Moon Daily Timings
          </h2>
          <p className="text-sm text-muted">
            Solar rise & set times paired with lunar arc schedule for {data.dateLabel}.
          </p>
        </div>

        {isPreview ? (
          <div
            onClick={scrollToPremium}
            className="cursor-pointer rounded-2xl border border-dashed border-accent/40 bg-accent/5 p-8 text-center transition-all hover:bg-accent/10 space-y-3"
          >
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-accent">
              <Lock className="h-4 w-4" />
              <span>Sun & Moon Detailed Timings locked for Tomorrow</span>
            </div>
            <p className="text-xs text-muted max-w-md mx-auto leading-relaxed">
              Detailed solar arc and lunar rise/set schedules are available for Today & Yesterday, or unlock all future dates with Premium.
            </p>
            <button className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-xs font-semibold text-white shadow-xs">
              Explore Premium Features
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Sun Card */}
            <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-4 shadow-xs">
              <div className="flex items-center gap-2.5 text-foreground">
                <Sun className="h-5 w-5 text-accent" />
                <h3 className="font-serif-title font-semibold text-lg">Solar Timings</h3>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm pt-2 border-t border-border/60">
                <div className="space-y-1">
                  <span className="text-xs text-muted font-medium">Sunrise</span>
                  <p className="text-lg font-semibold tabular-nums text-foreground">
                    {fullData?.sunrise}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted font-medium">Sunset</span>
                  <p className="text-lg font-semibold tabular-nums text-foreground">
                    {fullData?.sunset}
                  </p>
                </div>
              </div>
            </div>

            {/* Moon Card */}
            <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-4 shadow-xs">
              <div className="flex items-center gap-2.5 text-foreground">
                <Moon className="h-5 w-5 text-gold" />
                <h3 className="font-serif-title font-semibold text-lg">Lunar Timings</h3>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm pt-2 border-t border-border/60">
                <div className="space-y-1">
                  <span className="text-xs text-muted font-medium">Moonrise</span>
                  <p className="text-lg font-semibold tabular-nums text-foreground">
                    {fullData?.moonrise}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted font-medium">Moonset</span>
                  <p className="text-lg font-semibold tabular-nums text-foreground">
                    {fullData?.moonset}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
