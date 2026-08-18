"use client";

import { Check, Lock, Code2, Calendar, MapPin, Sparkles, Search, Globe } from "lucide-react";

export function ProductTiersSection() {
  const basicFeatures = [
    "Today's Panchangam",
    "Current location detection",
    "Sunrise & Sunset timings",
    "Moonrise & Moonset timings",
    "Tithi & Paksha",
    "Nakshatra & Constellation",
    "Yoga & Karana",
    "Rahu Kalam & Yamagandam",
    "Abhijit Muhurtham & Amrita Kalam",
  ];

  const premiumCapabilities = [
    {
      title: "Explore Any Date",
      description: "Navigate backward or forward to inspect complete Panchangam data for future & past dates.",
      icon: Calendar,
      previewBadge: "Calendar Preview",
    },
    {
      title: "Festival & Vrata Calendar",
      description: "Annual list of auspicious observances, Diwali, Mahashivratri, and regional fasts.",
      icon: Sparkles,
      previewBadge: "Festival Preview",
    },
    {
      title: "Tithi & Nakshatra Finder",
      description: "Search when specific Tithis or Nakshatras occur across the calendar year.",
      icon: Search,
      previewBadge: "Directory Preview",
    },
    {
      title: "Calculate Any Location",
      description: "Custom global latitude, longitude, and timezone calculations.",
      icon: MapPin,
      previewBadge: "Location Preview",
    },
  ];

  const apiCapabilities = [
    "Date-based Panchangam Endpoint (`/api/v1/panchangam/date`)",
    "Location-aware Panchangam (`/api/v1/panchangam/today`)",
    "Monthly & Annual Calendar Data (`/api/v1/calendar/month`)",
    "Festival Directory & Search (`/api/v1/festivals/month`)",
    "Tithi & Nakshatra Lookup APIs (`/api/v1/tithis/search`)",
    "Structured JSON Responses & OpenAPI Spec",
  ];

  return (
    <section id="product-tiers" className="py-16 sm:py-24 border-b border-border/60">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Header */}
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-gold">
            Product Levels
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif-title font-semibold text-foreground">
            Basic, Premium & API
          </h2>
          <p className="text-sm text-muted">
            Start with today&apos;s free Panchangam, unlock exploration beyond today with Premium, or power your application with the Panchangam API.
          </p>
        </div>

        {/* Product Tier 1: Basic */}
        <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-10 shadow-xs space-y-6">
          <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-border/60 pb-6">
            <div>
              <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                Free Forever
              </span>
              <h3 className="text-2xl font-serif-title font-bold text-foreground mt-2">Basic</h3>
              <p className="text-xs text-muted mt-1">Core daily Panchangam for today.</p>
            </div>
            <span className="text-sm font-semibold text-foreground">Current Plan</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {basicFeatures.map((feat) => (
              <div key={feat} className="flex items-center gap-2.5 text-xs text-foreground font-medium">
                <Check className="h-4 w-4 text-accent shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Product Tier 2: Premium (Explore Beyond Today - Locked Previews) */}
        <div className="rounded-3xl border border-gold/40 bg-gradient-to-b from-card to-card-muted/50 p-6 sm:p-10 shadow-xs space-y-8">
          <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-border/60 pb-6">
            <div>
              <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold">
                Explore Beyond Today
              </span>
              <h3 className="text-2xl font-serif-title font-bold text-foreground mt-2">
                Premium
              </h3>
              <p className="text-xs text-muted mt-1">
                Unlock multi-date exploration, calendar search, and custom locations.
              </p>
            </div>

            <button
              onClick={() => alert("Premium subscription coming soon!")}
              className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-2.5 text-xs font-semibold text-white shadow-xs transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Lock className="h-3.5 w-3.5" />
              <span>Upgrade to Premium</span>
            </button>
          </div>

          {/* Locked Preview Grid */}
          <div className="grid gap-6 sm:grid-cols-2">
            {premiumCapabilities.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="relative overflow-hidden rounded-2xl border border-border/80 bg-card p-6 space-y-3 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/10 text-gold">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card-muted px-2.5 py-0.5 text-[10px] font-semibold text-muted">
                      <Lock className="h-3 w-3 text-gold" />
                      {item.previewBadge}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-serif-title font-semibold text-foreground">
                      {item.title}
                    </h4>
                    <p className="mt-1 text-xs text-muted leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Subtle lock overlay on hover */}
                  <div className="pt-2 flex items-center gap-1 text-[11px] font-semibold text-gold opacity-90 group-hover:opacity-100 transition-opacity">
                    <span>Unlock with Premium</span>
                    <span>→</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Product Tier 3: API */}
        <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-10 shadow-xs space-y-6">
          <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-border/60 pb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 text-slate-100 px-3 py-1 text-xs font-semibold">
                <Code2 className="h-3.5 w-3.5" />
                <span>Developer Integration</span>
              </div>
              <h3 className="text-2xl font-serif-title font-bold text-foreground mt-2">
                Panchangam API
              </h3>
              <p className="text-xs text-muted mt-1">
                Power your product with structured astronomical JSON responses.
              </p>
            </div>

            <a
              href="/api/openapi"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card-muted px-5 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-card"
            >
              <span>View OpenAPI Spec</span>
              <Globe className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {apiCapabilities.map((cap) => (
              <div key={cap} className="flex items-center gap-2.5 text-xs font-mono text-muted">
                <Code2 className="h-3.5 w-3.5 text-accent shrink-0" />
                <span className="truncate">{cap}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
