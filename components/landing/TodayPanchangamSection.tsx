"use client";

import { Sparkles, Sun, Moon, MapPin } from "lucide-react";
import { formatLocationCity } from "@/lib/location";
import type { PanchangamDay, LocationParameters } from "@/lib/types/panchangam";

interface TodayPanchangamSectionProps {
  data: PanchangamDay;
  location?: LocationParameters;
}

export function TodayPanchangamSection({ data, location }: TodayPanchangamSectionProps) {
  const loc = location || { latitude: null, longitude: null, timezone: "Asia/Kolkata" };
  const city = formatLocationCity(loc);

  return (
    <section id="todays-panchangam" className="py-16 sm:py-20 border-b border-border/60">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="border-b border-border/70 pb-6 flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">
              Core Panchangam
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif-title font-semibold text-foreground mt-1">
              Today&apos;s Panchangam
            </h2>
            <p className="text-sm text-muted mt-1">
              {data.dateLabel} · {data.vara} · {data.paksha} Paksha
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted font-medium bg-card-muted/80 px-3 py-1.5 rounded-full border border-border/60">
            <MapPin className="h-3.5 w-3.5 text-accent" />
            <span>{city} ({loc.timezone})</span>
          </div>
        </div>

        {/* Festival Ribbon if present */}
        {data.festivals && data.festivals.length > 0 && (
          <div className="flex items-center gap-3 rounded-xl border border-accent/30 bg-accent/10 px-5 py-3.5 text-foreground">
            <Sparkles className="h-5 w-5 text-accent shrink-0" />
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                Today&apos;s Festival
              </span>
              <p className="text-base font-serif-title font-semibold">
                {data.festivals.join(" · ")}
              </p>
            </div>
          </div>
        )}

        {/* Primary Anga Breakdown (Unified Grouping, Editorial Typography) */}
        <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 space-y-6 shadow-xs">
          {/* Top Row: Tithi & Nakshatra */}
          <div className="grid gap-6 sm:grid-cols-2 border-b border-border/60 pb-6">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                Primary Tithi
              </span>
              <p className="text-2xl sm:text-3xl font-serif-title font-bold text-foreground">
                {data.tithi}
              </p>
              <p className="text-xs text-accent font-medium">{data.paksha} Paksha</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                Nakshatra
              </span>
              <p className="text-2xl sm:text-3xl font-serif-title font-bold text-foreground">
                {data.nakshatra}
              </p>
              <p className="text-xs text-gold font-medium">Ruling Star of the Day</p>
            </div>
          </div>

          {/* Middle Row: Yoga & Karana */}
          <div className="grid gap-6 sm:grid-cols-2 border-b border-border/60 pb-6">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">Yoga</span>
              <p className="text-xl font-serif-title font-semibold text-foreground">{data.yoga}</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">Karana</span>
              <p className="text-xl font-serif-title font-semibold text-foreground">{data.karana}</p>
            </div>
          </div>

          {/* Bottom Row: Solar & Lunar Arc Timings */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm pt-2">
            <div className="space-y-0.5">
              <span className="text-xs text-muted flex items-center gap-1.5">
                <Sun className="h-3.5 w-3.5 text-accent" /> Sunrise
              </span>
              <span className="font-semibold tabular-nums text-foreground">{data.sunrise}</span>
            </div>

            <div className="space-y-0.5">
              <span className="text-xs text-muted flex items-center gap-1.5">
                <Sun className="h-3.5 w-3.5 text-accent opacity-80" /> Sunset
              </span>
              <span className="font-semibold tabular-nums text-foreground">{data.sunset}</span>
            </div>

            <div className="space-y-0.5">
              <span className="text-xs text-muted flex items-center gap-1.5">
                <Moon className="h-3.5 w-3.5 text-gold" /> Moonrise
              </span>
              <span className="font-semibold tabular-nums text-foreground">{data.moonrise}</span>
            </div>

            <div className="space-y-0.5">
              <span className="text-xs text-muted flex items-center gap-1.5">
                <Moon className="h-3.5 w-3.5 text-muted" /> Moonset
              </span>
              <span className="font-semibold tabular-nums text-foreground">{data.moonset}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
