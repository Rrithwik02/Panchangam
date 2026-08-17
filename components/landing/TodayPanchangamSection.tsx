"use client";

import { Sparkles, Sun, Moon, Clock } from "lucide-react";
import type { PanchangamDay } from "@/lib/types/panchangam";

interface TodayPanchangamSectionProps {
  data: PanchangamDay;
}

export function TodayPanchangamSection({ data }: TodayPanchangamSectionProps) {
  return (
    <section id="todays-panchangam" className="py-16 sm:py-24 border-b border-border/60">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">
            Main Product Experience
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif-title font-semibold text-foreground">
            Today&apos;s Panchangam
          </h2>
          <p className="text-sm text-muted">
            Overview for {data.dateLabel} ({data.vara}) · {data.paksha} Paksha
          </p>
        </div>

        {/* Festival Ribbon if active */}
        {data.festivals && data.festivals.length > 0 && (
          <div className="flex items-center gap-3 rounded-2xl border border-accent/30 bg-accent/10 px-5 py-4">
            <Sparkles className="h-5 w-5 text-accent shrink-0" />
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                Today&apos;s Festival
              </span>
              <p className="text-base font-serif-title font-semibold text-foreground">
                {data.festivals.join(" · ")}
              </p>
            </div>
          </div>
        )}

        {/* Core Panchangam Attributes Grid */}
        <div className="grid gap-6 md:grid-cols-4">
          {/* Tithi */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">Tithi</span>
            <p className="text-2xl font-serif-title font-bold text-foreground">{data.tithi}</p>
            <p className="text-xs text-muted font-medium">{data.paksha} Paksha</p>
          </div>

          {/* Nakshatra */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">Nakshatra</span>
            <p className="text-2xl font-serif-title font-bold text-foreground">{data.nakshatra}</p>
            <p className="text-xs text-gold font-medium">Ruling Star</p>
          </div>

          {/* Yoga */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">Yoga</span>
            <p className="text-2xl font-serif-title font-bold text-foreground">{data.yoga}</p>
            <p className="text-xs text-muted font-medium">Solar-Lunar Position</p>
          </div>

          {/* Karana */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">Karana</span>
            <p className="text-2xl font-serif-title font-bold text-foreground">{data.karana}</p>
            <p className="text-xs text-muted font-medium">Half Tithi</p>
          </div>
        </div>

        {/* Solar & Lunar Quick Overview Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 rounded-2xl border border-border/70 bg-card-muted/60 p-6">
          <div className="flex items-center gap-3">
            <Sun className="h-5 w-5 text-accent shrink-0" />
            <div>
              <span className="block text-xs text-muted">Sunrise</span>
              <span className="text-sm font-semibold tabular-nums text-foreground">{data.sunrise}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Sun className="h-5 w-5 text-accent shrink-0 opacity-80" />
            <div>
              <span className="block text-xs text-muted">Sunset</span>
              <span className="text-sm font-semibold tabular-nums text-foreground">{data.sunset}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Moon className="h-5 w-5 text-gold shrink-0" />
            <div>
              <span className="block text-xs text-muted">Moonrise</span>
              <span className="text-sm font-semibold tabular-nums text-foreground">{data.moonrise}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Moon className="h-5 w-5 text-muted shrink-0 opacity-70" />
            <div>
              <span className="block text-xs text-muted">Moonset</span>
              <span className="text-sm font-semibold tabular-nums text-foreground">{data.moonset}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
