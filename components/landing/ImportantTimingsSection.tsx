"use client";

import { ShieldAlert, CheckCircle2, Clock } from "lucide-react";
import type { PanchangamDay } from "@/lib/types/panchangam";

interface ImportantTimingsSectionProps {
  data: PanchangamDay;
}

export function ImportantTimingsSection({ data }: ImportantTimingsSectionProps) {
  return (
    <section id="important-timings" className="py-16 sm:py-20 border-b border-border/60">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">
            Daily Hours
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif-title font-semibold text-foreground">
            Important Timings
          </h2>
          <p className="text-sm text-muted">
            Inauspicious time windows (Kalam) and auspicious periods for daily activities.
          </p>
        </div>

        {/* Timings Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Inauspicious Periods */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
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
          <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
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
                <span className="text-muted">Amrita Kalam / Ghadiya</span>
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
