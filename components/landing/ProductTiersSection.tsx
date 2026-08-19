"use client";

import { Check, Lock, Code, Sparkles, ArrowRight } from "lucide-react";

export function ProductTiersSection() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section id="premium" className="py-16 sm:py-24 border-b border-border/60 bg-card-muted/30">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">
            Panchangam Products & Plans
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif-title font-bold tracking-tight text-foreground">
            Simple, Transparent Pricing
          </h2>
          <p className="text-sm sm:text-base text-muted leading-relaxed">
            Choose the experience that fits your daily spiritual practice or product integration needs.
          </p>
        </div>

        {/* Three Vertical Cards placed Horizontally on Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* Card 1: BASIC */}
          <div className="flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-6 sm:p-8 space-y-6 shadow-xs hover:border-border transition-all">
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Daily Core
                </span>
                <h3 className="text-2xl font-serif-title font-bold text-foreground">Basic</h3>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight text-foreground">$0</span>
                <span className="text-xs text-muted font-medium">/ forever</span>
              </div>

              <p className="text-xs text-muted leading-relaxed">
                Today&apos;s core Panchangam experience for daily astronomical observation.
              </p>

              <hr className="border-border/60 my-4" />

              <ul className="space-y-2.5 text-xs text-foreground/90">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-accent shrink-0" />
                  <span>Today&apos;s complete Tithi, Vara & Nakshatra</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-accent shrink-0" />
                  <span>Sunrise, Sunset, Moonrise & Moonset</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-accent shrink-0" />
                  <span>Rahu Kalam & Brahma Muhurtham</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-accent shrink-0" />
                  <span>Real-time 3D celestial trajectory</span>
                </li>
              </ul>
            </div>

            <button
              onClick={scrollToTop}
              className="w-full rounded-full border border-border bg-card-muted/60 py-2.5 text-xs font-semibold text-foreground transition-all hover:bg-card-muted hover:border-foreground/20"
            >
              Current Experience
            </button>
          </div>

          {/* Card 2: PREMIUM (Featured) */}
          <div className="relative flex flex-col justify-between rounded-2xl border-2 border-accent bg-card p-6 sm:p-8 space-y-6 shadow-md scale-[1.02] z-10">
            {/* Featured Badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-[11px] font-semibold text-white shadow-xs">
              <Sparkles className="h-3 w-3" />
              <span>Recommended</span>
            </div>

            <div className="space-y-4 pt-2">
              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                  Full Explorer
                </span>
                <h3 className="text-2xl font-serif-title font-bold text-foreground">Premium</h3>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight text-foreground">$9</span>
                <span className="text-xs text-muted font-medium">/ month</span>
              </div>

              <p className="text-xs text-muted leading-relaxed">
                Unlock full past & future date exploration, festival calendar, and location search.
              </p>

              <hr className="border-border/60 my-4" />

              <ul className="space-y-2.5 text-xs text-foreground/90">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-accent shrink-0" />
                  <strong className="font-semibold">Full Yesterday, Today & Tomorrow access</strong>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-accent shrink-0" />
                  <span>Explore any historical or future date</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-accent shrink-0" />
                  <span>Complete Festival Calendar & Vratas</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-accent shrink-0" />
                  <span>Tithi, Nakshatra, Yoga & Karana finder</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-accent shrink-0" />
                  <span>Worldwide multi-location search</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => alert("Premium subscription checkout coming soon!")}
              className="w-full rounded-full bg-accent py-3 text-xs font-semibold text-white shadow-sm shadow-accent/20 transition-all hover:bg-accent-hover hover:scale-[1.01]"
            >
              Upgrade to Premium
            </button>
          </div>

          {/* Card 3: API */}
          <div className="flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-6 sm:p-8 space-y-6 shadow-xs hover:border-border transition-all">
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Developer & Business
                </span>
                <h3 className="text-2xl font-serif-title font-bold text-foreground">API Tier</h3>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight text-foreground">$29</span>
                <span className="text-xs text-muted font-medium">/ month</span>
              </div>

              <p className="text-xs text-muted leading-relaxed">
                Panchangam calculation engine & API endpoints for developers and apps.
              </p>

              <hr className="border-border/60 my-4" />

              <ul className="space-y-2.5 text-xs text-foreground/90">
                <li className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-accent shrink-0" />
                  <span>Structured JSON REST API endpoints</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-accent shrink-0" />
                  <span>High availability & low-latency CDN</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-accent shrink-0" />
                  <span>Unlimited global location calculations</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-accent shrink-0" />
                  <span>OpenAPI 3.0 spec & documentation</span>
                </li>
              </ul>
            </div>

            <a
              href="/api/openapi"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card-muted/60 py-2.5 text-xs font-semibold text-foreground transition-all hover:bg-card-muted hover:border-foreground/20"
            >
              <span>View OpenAPI Spec</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
