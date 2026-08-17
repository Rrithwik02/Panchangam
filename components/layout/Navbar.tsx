"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DayPhaseBadge } from "@/components/celestial/DayPhaseBadge";
import { cn } from "@/lib/utils";

export type NavTab = "today" | "calendar" | "explore" | "premium";

interface NavbarProps {
  activeTab?: NavTab;
  onTabChange?: (tab: NavTab) => void;
}

export function Navbar({ activeTab = "today", onTabChange }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const tabs: { id: NavTab; label: string }[] = [
    { id: "today", label: "Today" },
    { id: "calendar", label: "Calendar" },
    { id: "explore", label: "Explore" },
    { id: "premium", label: "Premium" },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-border/80 shadow-sm backdrop-blur-xl bg-card/90"
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
          onClick={(e) => {
            if (onTabChange) {
              e.preventDefault();
              onTabChange("today");
            }
          }}
          className="flex shrink-0 items-center gap-2.5 font-semibold tracking-tight transition-opacity hover:opacity-80"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent text-sm font-bold text-white shadow-sm shadow-accent/20">
            𑆪
          </span>
          <span className="font-serif-title text-lg font-bold tracking-tight">Panchangam</span>
        </Link>

        {/* Unified View Navigation Tabs */}
        <div className="flex items-center gap-1 rounded-full border border-border/70 bg-card-muted/60 p-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange?.(tab.id)}
                className={cn(
                  "px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all duration-200",
                  isActive
                    ? "bg-accent text-white shadow-xs"
                    : "text-muted hover:text-foreground hover:bg-card/60"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right side items */}
        <div className="hidden sm:flex items-center gap-3">
          <DayPhaseBadge />
        </div>
      </nav>
    </header>
  );
}
