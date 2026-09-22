"use client";

import type { ReactNode } from "react";
import { Sunrise, Sunset, Moon, ArrowRight } from "lucide-react";
import { parseClockTimeToMinutes } from "@/lib/panchangam-timeline";
import type { PanchangamDay, PanchangamPreviewDay } from "@/lib/types/panchangam";

interface SunMoonSectionProps {
  data: PanchangamDay | PanchangamPreviewDay;
}

function daylightSpanPercent(sunrise?: string, sunset?: string): number | null {
  if (!sunrise || !sunset) return null;
  const start = parseClockTimeToMinutes(sunrise);
  const end = parseClockTimeToMinutes(sunset);
  if (start === null || end === null || end <= start) return null;
  return ((end - start) / (24 * 60)) * 100;
}

export function SunMoonSection({ data }: SunMoonSectionProps) {
  const isPreview = "access" in data && data.access === "preview";
  const fullData = isPreview ? null : (data as PanchangamDay);
  const daylightPercent = daylightSpanPercent(fullData?.sunrise, fullData?.sunset);

  const scrollToPremium = () => {
    document.getElementById("premium")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="sun-moon" className="py-16 sm:py-20 border-b border-border/60">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Section Header */}
        <div className="border-b border-border/70 pb-4 space-y-1">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">
            Celestial Trajectory
          </span>
          <h2 className="text-3xl font-serif-title font-semibold text-foreground">
            Sun &amp; Moon Timings
          </h2>
          <p className="text-sm text-muted">
            Solar rise &amp; set paired with the lunar arc for {data.dateLabel}.
          </p>
        </div>

        {isPreview ? (
          <div
            onClick={scrollToPremium}
            className="cursor-pointer rounded-2xl border border-dashed border-border bg-card-muted/40 p-6 text-center transition-all hover:border-accent/40 space-y-1.5"
          >
            <p className="text-sm font-semibold text-foreground/80">
              Solar &amp; lunar timings become available once tomorrow arrives
            </p>
            <button className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline">
              Unlock every future date with Premium
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              <SunMoonStat icon={<Sunrise className="h-4 w-4 text-accent" />} label="Sunrise" value={fullData?.sunrise} />
              <SunMoonStat icon={<Sunset className="h-4 w-4 text-accent/80" />} label="Sunset" value={fullData?.sunset} />
              <SunMoonStat icon={<Moon className="h-4 w-4 text-gold" />} label="Moonrise" value={fullData?.moonrise} />
              <SunMoonStat icon={<Moon className="h-4 w-4 text-muted" />} label="Moonset" value={fullData?.moonset} />
            </div>

            {daylightPercent !== null && (
              <div className="space-y-2 border-t border-border/60 pt-5">
                <div className="flex items-center justify-between text-xs text-muted font-medium">
                  <span>Daylight span</span>
                  <span>{Math.round((daylightPercent / 100) * 24 * 10) / 10} hrs</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-border/50 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-accent to-gold"
                    style={{ width: `${daylightPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function SunMoonStat({ icon, label, value }: { icon: ReactNode; label: string; value?: string }) {
  return (
    <div className="space-y-1.5">
      <span className="flex items-center gap-1.5 text-xs text-muted font-medium">
        {icon}
        {label}
      </span>
      <p className="text-lg sm:text-xl font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  );
}
