"use client";

import Link from "next/link";
import { MapPin, ArrowDown, CalendarRange } from "lucide-react";
import { CelestialHeroCanvas } from "@/components/celestial/CelestialHeroCanvas";
import { formatLocationCity } from "@/lib/location";
import { useAuth } from "@/components/auth/AuthProvider";
import type { PanchangamDay, LocationParameters } from "@/lib/types/panchangam";

interface HeroSectionProps {
  data: PanchangamDay;
  location?: LocationParameters;
  cityName?: string | null;
}

export function HeroSection({ data, location, cityName }: HeroSectionProps) {
  const loc = location || { latitude: null, longitude: null, timezone: "Asia/Kolkata" };
  const city = formatLocationCity(loc, cityName);
  const { plan } = useAuth();

  return (
    <section className="relative min-h-[460px] sm:min-h-[520px] flex flex-col justify-center items-center overflow-hidden px-4 py-16 sm:px-6 lg:px-8 text-center border-b border-border/60">
      {/* Three.js Celestial Scene (Realistic Sun, Sunset Atmosphere & Dynamic API Moon Phase) */}
      <CelestialHeroCanvas />

      {/* Backdrop Gradient Overlay for High Contrast Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/75 to-background z-[1] pointer-events-none" />

      {/* Hero Foreground Content */}
      <div className="relative z-10 max-w-2xl space-y-5">
        {/* Device Location & Local Date Badge */}
        <div className="inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-border/80 bg-card/85 px-4 py-1.5 text-xs text-muted backdrop-blur-md shadow-xs">
          <MapPin className="h-3.5 w-3.5 text-accent shrink-0" aria-hidden="true" />
          <span>
            Panchangam for <strong className="font-semibold text-foreground">{city}</strong>
          </span>
          <span className="text-border">·</span>
          <span>Local time · {loc.timezone}</span>
          <span className="text-border">·</span>
          <span className="font-semibold text-foreground">{data.dateLabel}</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-serif-title font-bold tracking-tight text-foreground leading-tight">
          Panchangam
        </h1>

        {/* Short Description */}
        <p className="text-sm sm:text-lg text-muted font-normal max-w-xl mx-auto leading-relaxed">
          Daily astronomical calendar & celestial timings. Explore Tithi, Nakshatra, solar trajectory, and auspicious periods.
        </p>

        {/* Primary CTA + secondary 50-year explorer (Pro) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <a
            href="#todays-panchangam"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-accent/20 transition-all hover:bg-accent-hover hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>View Today&apos;s Panchangam</span>
            <ArrowDown className="h-4 w-4" />
          </a>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/85 px-6 py-3 text-sm font-semibold text-foreground shadow-xs backdrop-blur-md transition-all hover:border-accent/40 hover:bg-card hover:scale-[1.02] active:scale-[0.98]"
          >
            <CalendarRange className="h-4 w-4 text-accent" />
            <span>Explore 50 Years</span>
            {plan !== "pro" && (
              <span className="rounded-full bg-accent/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent">
                Pro
              </span>
            )}
          </Link>
        </div>
      </div>
    </section>
  );
}
