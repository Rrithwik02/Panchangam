"use client";

import Link from "next/link";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { CelestialScene } from "@/components/celestial/CelestialScene";
import { PanchangamCard } from "@/components/panchangam/PanchangamCard";
import { Button } from "@/components/ui/button";
import { todaysPanchangam } from "@/lib/mock-panchangam";
import { useReducedMotion } from "@/lib/motion";

gsap.registerPlugin(useGSAP);

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from("[data-hero='eyebrow']", { opacity: 0, y: 16, duration: 0.5 })
        .from("[data-hero='title']", { opacity: 0, y: 28, duration: 0.65 }, "-=0.25")
        .from("[data-hero='subtitle']", { opacity: 0, y: 20, duration: 0.55 }, "-=0.35")
        .from("[data-hero='copy']", { opacity: 0, y: 16, duration: 0.5 }, "-=0.3")
        .from("[data-hero='cta']", { opacity: 0, y: 16, duration: 0.5 }, "-=0.25")
        .from(
          "[data-hero='card']",
          { opacity: 0, y: 40, scale: 0.96, duration: 0.8 },
          "-=0.45"
        );
    },
    { scope: sectionRef, dependencies: [reduced] }
  );

  return (
    <section
      ref={sectionRef}
      className="hero-gradient relative overflow-hidden px-4 pb-20 pt-12 sm:px-6 lg:px-8 lg:pb-28 lg:pt-20"
    >
      <CelestialScene />

      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <p
            data-hero="eyebrow"
            className="text-sm font-medium uppercase tracking-wider text-accent"
          >
            Know today. Plan ahead.
          </p>
          <h1
            data-hero="title"
            className="text-hero mt-4 font-semibold tracking-tight"
          >
            Today&apos;s Panchangam, beautifully simplified.
          </h1>
          <p
            data-hero="subtitle"
            className="text-subheading mt-6 max-w-xl text-muted"
          >
            Everything you need to know about today, in one clear and peaceful
            experience.
          </p>
          <p data-hero="copy" className="mt-4 max-w-xl text-muted">
            Check today&apos;s Tithi, Nakshatra, timings, festivals, and more.
            Need another date? Premium lets you explore beyond today.
          </p>
          <div
            data-hero="cta"
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Button asChild size="lg">
              <Link href="/today">View Today&apos;s Panchangam</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="#premium">Explore Premium</Link>
            </Button>
          </div>
        </div>

        <div data-hero="card" className="flex justify-center lg:justify-end">
          <PanchangamCard data={todaysPanchangam} variant="hero" />
        </div>
      </div>
    </section>
  );
}
