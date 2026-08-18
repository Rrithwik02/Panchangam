"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { DayPhaseBadge } from "@/components/celestial/DayPhaseBadge";
import { formatLocationCity } from "@/lib/location";
import { useTimeOfDayOptional } from "@/components/celestial/TimeOfDayProvider";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "#todays-panchangam", label: "Today" },
  { href: "#sun-moon", label: "Sun & Moon" },
  { href: "#important-timings", label: "Timings" },
  { href: "#product-tiers", label: "Premium" },
  { href: "#product-tiers", label: "API" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const timeOfDay = useTimeOfDayOptional();
  const city = timeOfDay?.info ? "Hyderabad" : "Hyderabad";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-border/80 shadow-xs backdrop-blur-xl bg-card/90"
          : "bg-transparent backdrop-blur-sm"
      )}
    >
      <nav
        className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 font-semibold tracking-tight transition-opacity hover:opacity-80"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent text-sm font-bold text-white shadow-xs">
            𑆪
          </span>
          <span className="font-serif-title text-lg font-bold tracking-tight">Panchangam</span>
        </Link>

        {/* Section Navigation Links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link, idx) => (
            <a
              key={`${link.label}-${idx}`}
              href={link.href}
              className="text-xs font-semibold text-muted transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right side items: Location & Day Phase */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1 text-xs text-muted font-medium bg-card-muted/80 px-2.5 py-1 rounded-full border border-border/60">
            <MapPin className="h-3 w-3 text-accent" />
            <span>{city}</span>
          </div>
          <DayPhaseBadge />
        </div>
      </nav>
    </header>
  );
}
