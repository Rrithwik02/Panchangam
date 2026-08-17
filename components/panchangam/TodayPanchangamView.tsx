"use client";

import { Clock, Moon, Sparkles, Sun, Sunrise, Sunset, ShieldAlert, CheckCircle2 } from "lucide-react";
import { CelestialOrbit3D } from "@/components/celestial/CelestialOrbit3D";
import { LocationBar } from "@/components/panchangam/LocationBar";
import type { PanchangamDay, LocationParameters } from "@/lib/types/panchangam";

interface TodayPanchangamViewProps {
  data: PanchangamDay;
  location?: LocationParameters;
  onRetryLocation?: () => void;
  isLocating?: boolean;
}

export function TodayPanchangamView({
  data,
  location,
  onRetryLocation,
  isLocating,
}: TodayPanchangamViewProps) {
  return (
    <div className="space-y-10">
      {/* Hero Celestial & Date Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-b from-card to-card-muted/40 p-6 sm:p-10 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">
              Daily Panchangam
            </span>
            <h1 className="mt-1 text-3xl sm:text-4xl font-serif-title font-semibold tracking-tight">
              {data.dateLabel}
            </h1>
            <p className="mt-0.5 text-sm text-muted font-medium">
              {data.vara} · {data.paksha} Paksha
            </p>
          </div>

          <LocationBar
            location={location}
            onRetryLocation={onRetryLocation}
            isLocating={isLocating}
          />
        </div>

        {/* 3D Celestial Orbit Visual */}
        <div className="mt-6 -mb-4">
          <CelestialOrbit3D height="220px" />
        </div>
      </div>

      {/* Festivals Banner */}
      {data.festivals && data.festivals.length > 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-accent/30 bg-accent/10 px-5 py-4 text-foreground">
          <Sparkles className="h-5 w-5 shrink-0 text-accent" />
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

      {/* Primary Panchangam Angas: Tithi & Nakshatra */}
      <section aria-labelledby="primary-angas-heading">
        <h2 id="primary-angas-heading" className="sr-only">
          Primary Panchangam Elements
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Tithi */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm transition-all hover:border-accent/40">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                Primary Tithi
              </span>
              <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                {data.paksha} Paksha
              </span>
            </div>
            <div className="mt-4">
              <p className="text-2xl sm:text-3xl font-serif-title font-bold text-foreground">
                {data.tithi}
              </p>
              <p className="mt-2 text-xs text-muted flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-accent" />
                Transition: Active throughout {data.vara}
              </p>
            </div>
          </div>

          {/* Nakshatra */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm transition-all hover:border-accent/40">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                Nakshatra
              </span>
              <span className="rounded-full bg-gold/10 px-2.5 py-0.5 text-xs font-medium text-gold">
                Constellation
              </span>
            </div>
            <div className="mt-4">
              <p className="text-2xl sm:text-3xl font-serif-title font-bold text-foreground">
                {data.nakshatra}
              </p>
              <p className="mt-2 text-xs text-muted flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-gold" />
                Transition: Ruling star of the day
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Secondary Angas: Yoga & Karana */}
      <section aria-labelledby="secondary-angas-heading">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Yoga */}
          <div className="rounded-2xl border border-border/70 bg-card p-5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Yoga
            </span>
            <p className="mt-2 text-xl font-serif-title font-semibold text-foreground">
              {data.yoga}
            </p>
          </div>

          {/* Karana */}
          <div className="rounded-2xl border border-border/70 bg-card p-5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Karana
            </span>
            <p className="mt-2 text-xl font-serif-title font-semibold text-foreground">
              {data.karana}
            </p>
          </div>
        </div>
      </section>

      {/* Solar & Lunar Arc Timings */}
      <section aria-labelledby="sun-moon-heading" className="space-y-3">
        <h3 id="sun-moon-heading" className="text-sm font-semibold uppercase tracking-wider text-muted">
          Solar & Lunar Arc Timings
        </h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-border/70 bg-card p-4 text-center">
            <Sunrise className="mx-auto h-5 w-5 text-accent" />
            <span className="mt-2 block text-xs text-muted">Sunrise</span>
            <span className="text-lg font-semibold tabular-nums text-foreground">{data.sunrise}</span>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card p-4 text-center">
            <Sunset className="mx-auto h-5 w-5 text-accent" />
            <span className="mt-2 block text-xs text-muted">Sunset</span>
            <span className="text-lg font-semibold tabular-nums text-foreground">{data.sunset}</span>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card p-4 text-center">
            <Moon className="mx-auto h-5 w-5 text-gold" />
            <span className="mt-2 block text-xs text-muted">Moonrise</span>
            <span className="text-lg font-semibold tabular-nums text-foreground">{data.moonrise}</span>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card p-4 text-center">
            <Moon className="mx-auto h-5 w-5 text-muted opacity-75" />
            <span className="mt-2 block text-xs text-muted">Moonset</span>
            <span className="text-lg font-semibold tabular-nums text-foreground">{data.moonset}</span>
          </div>
        </div>
      </section>

      {/* Inauspicious & Auspicious Timings */}
      <section aria-labelledby="timings-heading" className="grid gap-6 md:grid-cols-2">
        {/* Inauspicious Periods */}
        <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-border/60 pb-3">
            <ShieldAlert className="h-4 w-4 text-rose-500" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Inauspicious Timings (Kalam)
            </h3>
          </div>

          <div className="space-y-3 divide-y divide-border/50 text-sm">
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
        <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-border/60 pb-3">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Auspicious Periods
            </h3>
          </div>

          <div className="space-y-3 divide-y divide-border/50 text-sm">
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
      </section>
    </div>
  );
}
