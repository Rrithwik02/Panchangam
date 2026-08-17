"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DayPhaseBadge } from "@/components/celestial/DayPhaseBadge";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "#todays-panchangam", label: "Today" },
  { href: "#daily-timings", label: "Timings" },
  { href: "#tithi-nakshatra", label: "Tithi & Nakshatra" },
  { href: "#calendar-festivals", label: "Calendar" },
  { href: "#explore", label: "Explore" },
  { href: "#premium", label: "Premium" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

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

        {/* Section Links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-xs font-semibold text-muted transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right side items */}
        <div className="flex items-center gap-3">
          <DayPhaseBadge />
        </div>
      </nav>
    </header>
  );
}
