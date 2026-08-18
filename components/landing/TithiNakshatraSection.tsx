"use client";

import { Moon, Star, Layers, Activity } from "lucide-react";
import type { PanchangamDay } from "@/lib/types/panchangam";

interface TithiNakshatraSectionProps {
  data: PanchangamDay;
}

export function TithiNakshatraSection({ data }: TithiNakshatraSectionProps) {
  return (
    <section id="tithi-nakshatra" className="py-16 sm:py-24 border-b border-border/60">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">
            Lunar Days & Constellations
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif-title font-semibold text-foreground">
            Tithi & Nakshatra Transitions
          </h2>
          <p className="text-sm text-muted">
            Detailed transition markers for the primary elements of the daily Panchangam.
          </p>
        </div>

        {/* Transition Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Tithi Card */}
          <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div className="flex items-center gap-2">
                <Moon className="h-5 w-5 text-accent" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Tithi & Paksha
                </span>
              </div>
              <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                {data.paksha} Paksha
              </span>
            </div>

            <div className="space-y-2">
              <span className="text-xs text-muted">Current Tithi</span>
              <p className="text-3xl font-serif-title font-bold text-foreground">
                {data.tithi}
              </p>
            </div>

            <div className="pt-4 border-t border-border/50 text-xs text-muted space-y-1">
              <p className="font-semibold text-foreground">Tithi Transition:</p>
              <p>Active throughout {data.vara} until next lunar phase transition.</p>
            </div>
          </div>

          {/* Nakshatra Card */}
          <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-gold" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Nakshatra
                </span>
              </div>
              <span className="rounded-full bg-gold/10 px-3 py-1 text-xs font-medium text-gold">
                Ruling Star
              </span>
            </div>

            <div className="space-y-2">
              <span className="text-xs text-muted">Current Nakshatra</span>
              <p className="text-3xl font-serif-title font-bold text-foreground">
                {data.nakshatra}
              </p>
            </div>

            <div className="pt-4 border-t border-border/50 text-xs text-muted space-y-1">
              <p className="font-semibold text-foreground">Nakshatra Transition:</p>
              <p>Prevailing lunar mansion for {data.dateLabel}.</p>
            </div>
          </div>
        </div>

        {/* Yoga & Karana Details */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-border/70 bg-card p-6 flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">Yoga</span>
              <p className="text-xl font-serif-title font-semibold text-foreground mt-1">{data.yoga}</p>
              <p className="text-xs text-muted mt-1">Astronomical sum of longitude of Sun and Moon.</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card p-6 flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-gold">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">Karana</span>
              <p className="text-xl font-serif-title font-semibold text-foreground mt-1">{data.karana}</p>
              <p className="text-xs text-muted mt-1">Half duration of a Tithi (6 degrees longitude difference).</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
