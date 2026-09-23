"use client";

import { ShieldAlert, Sparkles, ArrowRight } from "lucide-react";
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
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Section Header */}
        <div className="border-b border-border/70 pb-4 space-y-1">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">
            Muhurtham &amp; Inauspicious Hours
          </span>
          <h2 className="text-3xl font-serif-title font-semibold text-foreground">
            Other Panchangam Timings
          </h2>
          <p className="text-sm text-muted">
            Inauspicious Rahu Kalam &amp; auspicious Brahma Muhurtham windows for {data.dateLabel}.
          </p>
        </div>

        {isPreview ? (
          <div
            onClick={scrollToPremium}
            className="cursor-pointer rounded-2xl border border-dashed border-border bg-card-muted/40 p-6 text-center transition-all hover:border-accent/40 space-y-1.5"
          >
            <p className="text-sm font-semibold text-foreground/80">
              Tomorrow&apos;s Rahu Kalam, Yamagandam &amp; Muhurtham windows are included with Pro
            </p>
            <button className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline">
              See Tomorrow in full with Pro
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            {/* Inauspicious Timings Group */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-muted pb-2 border-b border-border/60">
                <ShieldAlert className="h-3.5 w-3.5" />
                <h3 className="text-xs font-semibold uppercase tracking-wider">Inauspicious Periods</h3>
              </div>

              <div className="space-y-2">
                <TimingItem label="Durmuhurtham" ranges={fullData?.durmuhurthams ?? []} />
                {fullData?.rahuKalam && <TimingItem label="Rahu Kalam" ranges={[fullData.rahuKalam]} />}
                {fullData?.yamagandam && <TimingItem label="Yamagandam" ranges={[fullData.yamagandam]} />}
                {fullData?.gulikaKalam && <TimingItem label="Gulika Kalam" ranges={[fullData.gulikaKalam]} />}
                <TimingItem label="Varjyam" ranges={fullData?.varjyams ?? []} />
              </div>
            </div>

            {/* Auspicious Timings Group */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-muted pb-2 border-b border-border/60">
                <Sparkles className="h-3.5 w-3.5 text-gold" />
                <h3 className="text-xs font-semibold uppercase tracking-wider">Auspicious Periods</h3>
              </div>

              <div className="space-y-2">
                {fullData?.brahmaMuhurtham && (
                  <TimingItem label="Brahma Muhurtham" ranges={[fullData.brahmaMuhurtham]} tone="gold" />
                )}
                <TimingItem label="Amrita Kalam" ranges={fullData?.amritaKalams ?? []} tone="gold" />
                {fullData?.abhijitMuhurtham && (
                  <TimingItem label="Abhijit Muhurtham" ranges={[fullData.abhijitMuhurtham]} tone="gold" />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// A day can carry more than one period for some fields (e.g. two Durmuhurtham
// windows). Renders the label once and every period underneath it.
function TimingItem({
  label,
  ranges,
  tone = "accent",
}: {
  label: string;
  ranges: TimingRange[];
  tone?: "accent" | "gold";
}) {
  if (ranges.length === 0) return null;

  return (
    <div className="rounded-lg px-3 py-2.5 text-xs text-foreground border-b border-border/40 last:border-b-0">
      <div className="flex items-center justify-between gap-3">
        <span className="font-medium text-foreground/80 flex items-center gap-2">
          <span className={`h-1.5 w-1.5 rounded-full ${tone === "accent" ? "bg-accent" : "bg-gold"}`} />
          {label}
        </span>
        <span className="font-semibold tabular-nums text-foreground shrink-0">
          {ranges[0].start} – {ranges[0].end}
        </span>
      </div>
      {ranges.slice(1).map((range, index) => (
        <div key={index} className="flex justify-end pt-1">
          <span className="font-semibold tabular-nums text-foreground/70 text-xs shrink-0">
            {range.start} – {range.end}
          </span>
        </div>
      ))}
    </div>
  );
}
