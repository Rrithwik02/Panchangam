"use client";

import { Sparkles, Sun, Moon, MapPin, Lock } from "lucide-react";
import { formatLocationCity } from "@/lib/location";
import type { PanchangamDay, PanchangamPreviewDay, LocationParameters } from "@/lib/types/panchangam";

interface TodayPanchangamSectionProps {
  data: PanchangamDay | PanchangamPreviewDay;
  location?: LocationParameters;
  cityName?: string | null;
  activeMode: "today" | "yesterday" | "tomorrow";
  onModeChange: (mode: "today" | "yesterday" | "tomorrow") => void;
  isLoading?: boolean;
}

export function TodayPanchangamSection({
  data,
  location,
  cityName,
  activeMode,
  onModeChange,
  isLoading = false,
}: TodayPanchangamSectionProps) {
  const loc = location || { latitude: null, longitude: null, timezone: "Asia/Kolkata" };
  const city = formatLocationCity(loc, cityName);

  const scrollToPremium = () => {
    document.getElementById("premium")?.scrollIntoView({ behavior: "smooth" });
  };

  const isPreview = "access" in data && data.access === "preview";
  const fullData = isPreview ? null : (data as PanchangamDay);

  return (
    <section id="todays-panchangam" className="py-16 sm:py-20 border-b border-border/60">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header & Date Switcher */}
        <div className="border-b border-border/70 pb-6 flex flex-wrap items-end justify-between gap-6">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">
              Daily Panchangam
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif-title font-semibold text-foreground">
              {data.dateLabel}
            </h2>
            <p className="text-sm text-muted">
              {data.vara} · {data.paksha} Paksha
            </p>
          </div>

          {/* Date Switcher: [ Yesterday ] [ Today ] [ Tomorrow ] */}
          <div className="flex items-center gap-1.5 rounded-full border border-border/80 bg-card-muted/60 p-1.5 shadow-xs">
            <button
              onClick={() => onModeChange("yesterday")}
              disabled={isLoading}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                activeMode === "yesterday"
                  ? "bg-accent text-white shadow-xs"
                  : "text-muted hover:text-foreground hover:bg-card-muted"
              }`}
            >
              Yesterday
            </button>

            <button
              onClick={() => onModeChange("today")}
              disabled={isLoading}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                activeMode === "today"
                  ? "bg-accent text-white shadow-xs"
                  : "text-muted hover:text-foreground hover:bg-card-muted"
              }`}
            >
              Today
            </button>

            <button
              onClick={() => onModeChange("tomorrow")}
              disabled={isLoading}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                activeMode === "tomorrow"
                  ? "bg-accent text-white shadow-xs"
                  : "text-muted hover:text-foreground hover:bg-card-muted"
              }`}
            >
              Tomorrow
            </button>
          </div>
        </div>

        {/* Festival Ribbon if present */}
        {fullData?.festivals && fullData.festivals.length > 0 && (
          <div className="flex items-center gap-3 rounded-xl border border-accent/30 bg-accent/10 px-5 py-3.5 text-foreground">
            <Sparkles className="h-5 w-5 text-accent shrink-0" />
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                Festival of the Day
              </span>
              <p className="text-base font-serif-title font-semibold">
                {fullData.festivals.join(" · ")}
              </p>
            </div>
          </div>
        )}

        {/* Primary Panchangam Data Card */}
        <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 space-y-6 shadow-xs relative overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 bg-card/60 backdrop-blur-xs flex items-center justify-center z-20">
              <div className="h-6 w-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            </div>
          )}

          {/* Top Row: Tithi & Nakshatra (Always Available) */}
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

          {/* Middle Row: Yoga & Karana (or Locked Preview) */}
          <div className="grid gap-6 sm:grid-cols-2 border-b border-border/60 pb-6">
            {isPreview ? (
              <div
                onClick={scrollToPremium}
                className="col-span-2 cursor-pointer rounded-xl border border-dashed border-accent/40 bg-accent/5 p-5 text-center transition-all hover:bg-accent/10 space-y-1.5"
              >
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent">
                  <Lock className="h-3.5 w-3.5" />
                  <span>Unlock full Panchangam (Yoga & Karana)</span>
                </div>
                <p className="text-xs text-muted">
                  Explore more future date details with Premium
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted">Yoga</span>
                  <p className="text-xl font-serif-title font-semibold text-foreground">{fullData?.yoga}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted">Karana</span>
                  <p className="text-xl font-serif-title font-semibold text-foreground">{fullData?.karana}</p>
                </div>
              </>
            )}
          </div>

          {/* Bottom Row: Solar & Lunar Timings (or Locked Preview) */}
          {isPreview ? (
            <div
              onClick={scrollToPremium}
              className="cursor-pointer rounded-xl border border-dashed border-border bg-card-muted/40 p-4 text-center transition-all hover:border-accent/40 space-y-1"
            >
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted">
                <Lock className="h-3.5 w-3.5 text-accent" />
                <span>Solar & Lunar Timings locked for Tomorrow preview</span>
              </div>
              <p className="text-xs text-muted/80">Click to view Premium plans</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm pt-2">
              <div className="space-y-0.5">
                <span className="text-xs text-muted flex items-center gap-1.5">
                  <Sun className="h-3.5 w-3.5 text-accent" /> Sunrise
                </span>
                <span className="font-semibold tabular-nums text-foreground">{fullData?.sunrise}</span>
              </div>

              <div className="space-y-0.5">
                <span className="text-xs text-muted flex items-center gap-1.5">
                  <Sun className="h-3.5 w-3.5 text-accent opacity-80" /> Sunset
                </span>
                <span className="font-semibold tabular-nums text-foreground">{fullData?.sunset}</span>
              </div>

              <div className="space-y-0.5">
                <span className="text-xs text-muted flex items-center gap-1.5">
                  <Moon className="h-3.5 w-3.5 text-gold" /> Moonrise
                </span>
                <span className="font-semibold tabular-nums text-foreground">{fullData?.moonrise}</span>
              </div>

              <div className="space-y-0.5">
                <span className="text-xs text-muted flex items-center gap-1.5">
                  <Moon className="h-3.5 w-3.5 text-muted" /> Moonset
                </span>
                <span className="font-semibold tabular-nums text-foreground">{fullData?.moonset}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
