"use client";

import { Clock, ShieldAlert, Sparkles, Lock } from "lucide-react";
import type { PanchangamDay, PanchangamPreviewDay, TimingRange } from "@/lib/types/panchangam";

interface ImportantTimingsSectionProps {
  data: PanchangamDay | PanchangamPreviewDay;
}

export function ImportantTimingsSection({ data }: ImportantTimingsSectionProps) {
  const isPreview = "access" in data && data.access === "preview";
  const fullData = isPreview ? null : (data as PanchangamDay);

  const scrollToPremium = () => {
    document.getElementById("premium")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="important-timings" className="py-16 sm:py-20 border-b border-border/60">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="border-b border-border/70 pb-4 space-y-1">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">
            Muhurtham & Inauspicious Hours
          </span>
          <h2 className="text-3xl font-serif-title font-semibold text-foreground">
            Important Timings
          </h2>
          <p className="text-sm text-muted">
            Inauspicious Rahu Kalam & auspicious Brahma Muhurtham windows for {data.dateLabel}.
          </p>
        </div>

        {isPreview ? (
          <div
            onClick={scrollToPremium}
            className="cursor-pointer rounded-2xl border border-dashed border-accent/40 bg-accent/5 p-8 text-center transition-all hover:bg-accent/10 space-y-3"
          >
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-accent">
              <Lock className="h-4 w-4" />
              <span>Auspicious & Inauspicious Timings locked for Tomorrow</span>
            </div>
            <p className="text-xs text-muted max-w-md mx-auto leading-relaxed">
              Rahu Kalam, Yamagandam, Abhijit Muhurtham, and Amrita Kalam windows are available for Today & Yesterday, or unlock all future dates with Premium.
            </p>
            <button className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-xs font-semibold text-white shadow-xs">
              Upgrade to Premium
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Inauspicious Timings Group */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-foreground pb-2 border-b border-border/60">
                <ShieldAlert className="h-4 w-4 text-accent" />
                <h3 className="font-serif-title font-semibold text-base">Inauspicious Periods</h3>
              </div>

              <div className="space-y-3">
                {fullData?.rahuKalam && (
                  <TimingItem label="Rahu Kalam" range={fullData.rahuKalam} isWarning />
                )}
                {fullData?.yamagandam && (
                  <TimingItem label="Yamagandam" range={fullData.yamagandam} isWarning />
                )}
                {fullData?.gulikaKalam && (
                  <TimingItem label="Gulika Kalam" range={fullData.gulikaKalam} isWarning />
                )}
                {fullData?.durmuhurtham && (
                  <TimingItem label="Durmuhurtham" range={fullData.durmuhurtham} isWarning />
                )}
              </div>
            </div>

            {/* Auspicious Timings Group */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-foreground pb-2 border-b border-border/60">
                <Sparkles className="h-4 w-4 text-gold" />
                <h3 className="font-serif-title font-semibold text-base">Auspicious Periods</h3>
              </div>

              <div className="space-y-3">
                {fullData?.abhijitMuhurtham && (
                  <TimingItem label="Abhijit Muhurtham" range={fullData.abhijitMuhurtham} />
                )}
                {fullData?.amritaKalam && (
                  <TimingItem label="Amrita Kalam" range={fullData.amritaKalam} />
                )}
                {fullData?.varjyam && (
                  <TimingItem label="Varjyam" range={fullData.varjyam} />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function TimingItem({ label, range, isWarning = false }: { label: string; range: TimingRange; isWarning?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border/70 bg-card p-3.5 text-xs text-foreground shadow-2xs">
      <span className="font-medium text-foreground/90 flex items-center gap-1.5">
        <Clock className={`h-3.5 w-3.5 ${isWarning ? "text-accent" : "text-gold"}`} />
        {label}
      </span>
      <span className="font-semibold tabular-nums text-foreground">
        {range.start} – {range.end}
      </span>
    </div>
  );
}
