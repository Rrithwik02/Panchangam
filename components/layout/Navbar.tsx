"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DayPhaseBadge } from "@/components/celestial/DayPhaseBadge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#premium", label: "Premium" },
  { href: "#faq", label: "FAQ" },
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
        "sticky top-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b border-border/80 shadow-sm backdrop-blur-xl"
          : "backdrop-blur-sm"
      )}
      style={{
        backgroundColor: scrolled ? "var(--nav-bg)" : "transparent",
      }}
    >
      <nav
        className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 font-semibold tracking-tight transition-opacity hover:opacity-80"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-sm font-bold text-white shadow-sm shadow-accent/25">
            P
          </span>
          <span>Panchangam</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted transition-colors duration-300 hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <DayPhaseBadge />
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href="/today">View Today&apos;s Panchangam</Link>
          </Button>
          <Button asChild size="sm" className="sm:hidden">
            <Link href="/today">Today</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}
