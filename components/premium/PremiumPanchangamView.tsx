"use client";

import { Calendar, Globe, Layers, Search, Sparkles } from "lucide-react";

export function PremiumPanchangamView() {
  const features = [
    {
      title: "Explore Any Date",
      icon: Calendar,
      description: "Navigate backward or forward to inspect complete Panchangam data for past and future years.",
    },
    {
      title: "Explore Any Location",
      icon: Globe,
      description: "Select custom global coordinates and timezones for accurate regional solar and lunar calculations.",
    },
    {
      title: "Full Panchangam Breakdown",
      icon: Layers,
      description: "Complete visibility into transition times, solar/lunar arc durations, and daily observances.",
    },
    {
      title: "Advanced Calendar Exploration",
      icon: Search,
      description: "Filter and search monthly calendars by festival, Tithi combination, or specific Nakshatra.",
    },
  ];

  return (
    <div className="space-y-10">
      {/* Header Banner */}
      <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-10 shadow-sm">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">
            <Sparkles className="h-3.5 w-3.5" />
            Panchangam Capabilities
          </div>
          <h2 className="text-3xl font-serif-title font-semibold">
            Expanded Astronomical Capabilities
          </h2>
          <p className="text-sm text-muted">
            Explore Panchangam calculations across dates, custom locations, and comprehensive calendar views.
          </p>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {features.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-serif-title font-semibold text-foreground">{item.title}</h3>
                <p className="mt-1.5 text-xs text-muted leading-relaxed">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Box */}
      <div className="rounded-2xl border border-border/70 bg-card-muted/60 p-6 text-center">
        <p className="text-sm font-medium text-foreground">
          Reference Panchangam Engine
        </p>
        <p className="mt-1 text-xs text-muted max-w-xl mx-auto">
          Currently operating with precomputed reference datasets for testing and presentation. Extended location lookup and multi-year astronomical engines will integrate seamlessly with these interfaces.
        </p>
      </div>
    </div>
  );
}
