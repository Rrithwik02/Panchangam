"use client";

import { MapPin, ArrowDown } from "lucide-react";
import { CelestialHeroCanvas } from "@/components/celestial/CelestialHeroCanvas";
import { formatLocationLabel } from "@/lib/location";
import type { PanchangamDay, LocationParameters } from "@/lib/types/panchangam";

interface HeroSectionProps {
  data: PanchangamDay;
  location?: LocationParameters;
  onExploreClick?: () => void;
}

export function HeroSection({ data, location, onExploreClick }: HeroSectionProps) {
  const locationLabel = location ? formatLocationLabel(location) : "Hyderabad · Asia/Kolkata";

  return (
    <section className="relative min-h-[85vh] flex flex-col justify-center items-center overflow-hidden px-4 py-20 sm:px-6 lg:px-8 text-center border-b border-border/60">
      {/* 3D Celestial Background Canvas */}
      <CelestialHeroCanvas />

      {/* High-Contrast Backdrop Overlay for Maximum Readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background z-[1] pointer-events-none" />

      {/* Hero Text Content (Foreground) */}
      <div className="relative z-10 max-w-3xl space-y-6">
        {/* Location & Date Badge */}
        <div className="inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-border/80 bg-card/80 px-4 py-1.5 text-xs text-muted backdrop-blur-md shadow-xs">
          <MapPin className="h-3.5 w-3.5 text-accent shrink-0" aria-hidden="true" />
          <span>
            Panchangam for <strong className="font-medium text-foreground">{locationLabel}</strong>
          </span>
          <span className="text-border">·</span>
          <span className="font-medium text-foreground">{data.dateLabel}</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif-title font-bold tracking-tight text-foreground leading-[1.08]">
          Panchangam
        </h1>

        {/* Description */}
        <p className="text-base sm:text-xl text-muted font-normal max-w-2xl mx-auto leading-relaxed">
          Daily astronomical calendar. Real-time Tithi, Nakshatra, solar & lunar trajectory, and auspicious timings in one calm, beautifully structured experience.
        </p>

        {/* Call to Action */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#todays-panchangam"
            onClick={(e) => {
              if (onExploreClick) {
                e.preventDefault();
                onExploreClick();
              }
            }}
            className="inline-flex items-center gap-2.5 rounded-full bg-accent px-7 py-3 text-sm font-semibold text-white shadow-md shadow-accent/20 transition-all hover:bg-accent-hover hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Explore Today&apos;s Panchangam</span>
            <ArrowDown className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
