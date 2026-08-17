"use client";

import { ShieldAlert, CheckCircle2, Clock, Sunrise, Sunset, Moon } from "lucide-react";
import type { PanchangamDay } from "@/lib/types/panchangam";

interface DailyTimingsSectionProps {
  data: PanchangamDay;
}

export function DailyTimingsSection({ data }: DailyTimingsSectionProps) {
  return (
    <section id="daily-timings" className="py-16 sm:py-24 border-b border-border/60">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">
            Celestial Trajectory & Timings
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif-title font-semibold text-foreground">
            Sun & Moon / Daily Timings
          </h2>
          <p className="text-sm text-muted">
            Solar hours, lunar phases, and auspicious / inauspicious time windows throughout the day.
          </p>
        </div>

        {/* Solar & Lunar Horizontal Timeline Bar */}
        <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs space-y-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-2">
            <Clock className="h-4 w-4 text-accent" />
            Solar & Lunar Arc Timings
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl border border-border/60 bg-card-muted/50 text-center">
              <Sunrise className="mx-auto h-5 w-5 text-accent" />
              <span className="mt-2 block text-xs text-muted">Sunrise</span>
              <span className="text-lg font-semibold tabular-nums text-foreground">{data.sunrise}</span>
            </div>

            <div className="p-4 rounded-2xl border border-border/60 bg-card-muted/50 text-center">
              <Sunset className="mx-auto h-5 w-5 text-accent" />
              <span className="mt-2 block text-xs text-muted">Sunset</span>
              <span className="text-lg font-semibold tabular-nums text-foreground">{data.sunset}</span>
            </div>

            <div className="p-4 rounded-2xl border border-border/60 bg-card-muted/50 text-center">
              <Moon className="mx-auto h-5 w-5 text-gold" />
              <span className="mt-2 block text-xs text-muted">Moonrise</span>
              <span className="text-lg font-semibold tabular-nums text-foreground">{data.moonrise}</span>
            </div>

            <div className="p-4 rounded-2xl border border-border/60 bg-card-muted/50 text-center">
              <Moon className="mx-auto h-5 w-5 text-muted opacity-70" />
              <span className="mt-2 block text-xs text-muted">Moonset</span>
              <span className="text-lg font-semibold tabular-nums text-foreground">{data.moonset}</span>
            </div>
          </div>
        </div>

        {/* Timings Grid: Inauspicious & Auspicious */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Inauspicious Periods */}
          <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 border-b border-border/60 pb-4">
              <ShieldAlert className="h-5 w-5 text-rose-500" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
                Inauspicious Periods (Kalam)
              </h3>
            </div>

            <div className="space-y-3.5 divide-y divide-border/50 text-sm">
              <div className="pt-2 flex justify-between items-center">
                <span className="text-muted">Rahu Kalam</span>
                <span className="font-semibold tabular-nums text-foreground">
                  {data.rahuKalam.start} – {data.rahuKalam.end}
                </span>
              </div>

              <div className="pt-3 flex justify-between items-center">
                <span className="text-muted">Yamagandam</span>
                <span className="font-semibold tabular-nums text-foreground">
                  {data.yamagandam.start} – {data.yamagandam.end}
                </span>
              </div>

              <div className="pt-3 flex justify-between items-center">
                <span className="text-muted">Gulika Kalam</span>
                <span className="font-semibold tabular-nums text-foreground">
                  {data.gulikaKalam.start} – {data.gulikaKalam.end}
                </span>
              </div>

              <div className="pt-3 flex justify-between items-center">
                <span className="text-muted">Durmuhurtham</span>
                <span className="font-semibold tabular-nums text-foreground">
                  {data.durmuhurtham.start} – {data.durmuhurtham.end}
                </span>
              </div>
            </div>
          </div>

          {/* Auspicious Periods */}
          <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 border-b border-border/60 pb-4">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
                Auspicious Periods
              </h3>
            </div>

            <div className="space-y-3.5 divide-y divide-border/50 text-sm">
              <div className="pt-2 flex justify-between items-center">
                <span className="text-muted">Abhijit Muhurtham</span>
                <span className="font-semibold tabular-nums text-foreground">
                  {data.abhijitMuhurtham.start} – {data.abhijitMuhurtham.end}
                </span>
              </div>

              <div className="pt-3 flex justify-between items-center">
                <span className="text-muted">Amrita Kalam</span>
                <span className="font-semibold tabular-nums text-foreground">
                  {data.amritaKalam.start} – {data.amritaKalam.end}
                </span>
              </div>

              <div className="pt-3 flex justify-between items-center">
                <span className="text-muted">Varjyam</span>
                <span className="font-semibold tabular-nums text-foreground">
                  {data.varjyam.start} – {data.varjyam.end}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
