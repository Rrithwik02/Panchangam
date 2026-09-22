"use client";

import { Sparkles, AlertCircle, ArrowRight } from "lucide-react";
import { PeriodGroup } from "@/components/panchangam/PeriodGroup";
import type { PanchangamDay, PanchangamPreviewDay, LocationParameters } from "@/lib/types/panchangam";

interface TodayPanchangamSectionProps {
  data: PanchangamDay | PanchangamPreviewDay;
  location?: LocationParameters;
  cityName?: string | null;
  activeMode: "today" | "yesterday" | "tomorrow";
  onModeChange: (mode: "today" | "yesterday" | "tomorrow") => void;
  isLoading?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
}

const MODES: { key: "yesterday" | "today" | "tomorrow"; label: string }[] = [
  { key: "yesterday", label: "Yesterday" },
  { key: "today", label: "Today" },
  { key: "tomorrow", label: "Tomorrow" },
];

export function TodayPanchangamSection({
  data,
  activeMode,
  onModeChange,
  isLoading = false,
  errorMessage = null,
  onRetry,
}: TodayPanchangamSectionProps) {
  const scrollToPremium = () => {
    document.getElementById("premium")?.scrollIntoView({ behavior: "smooth" });
  };

  const isPreview = "access" in data && data.access === "preview";
  const fullData = isPreview ? null : (data as PanchangamDay);

  const tithis = data.tithis ?? [];
  const nakshatras = data.nakshatras ?? [];
  const yogas = fullData?.yogas ?? [];
  const karanas = fullData?.karanas ?? [];
  const vratas = fullData?.vratas ?? [];

  return (
    <section id="todays-panchangam" className="py-16 sm:py-20 border-b border-border/60">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-6">
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
          <div
            className="flex items-center gap-1.5 rounded-full border border-border/80 bg-card-muted/60 p-1.5 shadow-xs"
            role="tablist"
            aria-label="Select date"
          >
            {MODES.map(({ key, label }) => (
              <button
                key={key}
                role="tab"
                aria-selected={activeMode === key}
                onClick={() => onModeChange(key)}
                disabled={isLoading}
                className={`min-h-[36px] rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                  activeMode === key
                    ? "bg-accent text-white shadow-xs"
                    : "text-muted hover:text-foreground hover:bg-card-muted"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {errorMessage && (
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-700 dark:text-red-400">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
              <p className="text-sm font-medium">{errorMessage}</p>
            </div>
            {onRetry && (
              <button
                onClick={onRetry}
                className="shrink-0 rounded-lg border border-red-500/40 px-3 py-1.5 text-xs font-semibold hover:bg-red-500/20 transition-colors"
              >
                Retry
              </button>
            )}
          </div>
        )}

        {/* Festival / Vrata Ribbon */}
        {((data.festivals && data.festivals.length > 0) || vratas.length > 0) && (
          <div className="flex items-start gap-3 rounded-xl border border-accent/30 bg-accent/10 px-5 py-3.5 text-foreground">
            <Sparkles className="h-5 w-5 text-accent shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              {data.festivals && data.festivals.length > 0 && (
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                    {data.festivals.length > 1 ? "Festivals of the Day" : "Festival of the Day"}
                  </span>
                  <p className="text-base font-serif-title font-semibold">
                    {data.festivals.join(" · ")}
                  </p>
                </div>
              )}
              {vratas.length > 0 && (
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                    {vratas.length > 1 ? "Vratas" : "Vrata"}
                  </span>
                  <p className="text-sm text-foreground/90">{vratas.join(" · ")}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Primary Panchangam Data Card */}
        <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 space-y-8 shadow-xs relative overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 bg-card/60 backdrop-blur-xs flex items-center justify-center z-20">
              <div className="h-6 w-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            </div>
          )}

          {/* Primary tier: Tithi & Nakshatra — always shown, every returned period rendered. */}
          <div className="grid gap-6 sm:grid-cols-2">
            <PeriodGroup label="Tithi" entries={tithis} tier="primary" accent="accent" />
            <PeriodGroup label="Nakshatra" entries={nakshatras} tier="primary" accent="gold" />
          </div>

          {/* Secondary tier: Yoga & Karana. Tomorrow is intentionally a lighter preview
              and does not show this detailed layer. */}
          {isPreview ? (
            <div
              onClick={scrollToPremium}
              className="cursor-pointer rounded-xl border border-dashed border-border bg-card-muted/40 p-5 text-center transition-all hover:border-accent/40 space-y-1"
            >
              <p className="text-xs font-semibold text-foreground/80">
                Yoga, Karana & daily timings become available once the date arrives
              </p>
              <button className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline">
                See what Premium unlocks for future dates
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 border-t border-border/60 pt-6">
              <PeriodGroup label="Yoga" entries={yogas} tier="secondary" accent="accent" />
              <PeriodGroup label="Karana" entries={karanas} tier="secondary" accent="gold" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
