"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { AnimatedSection } from "@/components/AnimatedSection";
import { PanchangamCard } from "@/components/panchangam/PanchangamCard";
import { todaysPanchangam, tomorrowPreview } from "@/lib/mock-panchangam";
import { useReducedMotion } from "@/lib/motion";
import { Calendar, Lock, Search } from "lucide-react";

const views = [
  {
    title: "Today's Panchangam",
    description: "Everything for today in one clear view.",
    content: "today" as const,
  },
  {
    title: "Date Navigation",
    description: "Browse dates with Premium calendar access.",
    content: "dates" as const,
  },
  {
    title: "Premium Locked Date",
    description: "Future dates unlock with Premium.",
    content: "locked" as const,
  },
  {
    title: "Festival Discovery",
    description: "Find festivals and tithis across the calendar.",
    content: "festival" as const,
  },
];

function MockPanel({ type }: { type: (typeof views)[number]["content"] }) {
  if (type === "today") {
    return <PanchangamCard data={todaysPanchangam} variant="hero" className="scale-90" />;
  }

  if (type === "dates") {
    const dates = ["13 Aug", "14 Aug", "15 Aug", "16 Aug"];
    return (
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center gap-2 text-sm font-medium">
          <Calendar className="h-4 w-4 text-accent" />
          August 2026
        </div>
        <div className="grid grid-cols-4 gap-2">
          {dates.map((d, i) => (
            <div
              key={d}
              className={`rounded-lg px-2 py-3 text-center text-xs ${
                i === 0
                  ? "bg-accent text-white"
                  : i > 0
                    ? "bg-card-muted text-muted"
                    : ""
              }`}
            >
              {d}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "locked") {
    return (
      <div className="relative w-full max-w-sm">
        <div className="rounded-2xl border border-border bg-card p-5 opacity-40 blur-[1px]">
          <p className="text-sm font-medium">15 August 2026</p>
          <p className="mt-2 text-xs text-muted">Tithi · Nakshatra · Timings</p>
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-dark/60 backdrop-blur-sm">
          <Lock className="h-6 w-6 text-gold" />
          <p className="mt-2 text-sm font-medium text-white">Premium</p>
          <p className="text-xs text-white/70">Unlock this date</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 rounded-lg border border-border bg-card-muted px-3 py-2 text-sm text-muted">
        <Search className="h-4 w-4" />
        Search festivals, tithis...
      </div>
      <div className="mt-4 space-y-2">
        <div className="rounded-lg bg-card-muted px-3 py-2 text-sm">
          Varalakshmi Vratham · 13 Aug
        </div>
        <div className="rounded-lg bg-card-muted px-3 py-2 text-sm">
          Shukla Saptami · 13 Aug
        </div>
        <div className="rounded-lg bg-card-muted px-3 py-2 text-sm text-muted">
          {tomorrowPreview.tithi} · 14 Aug
        </div>
      </div>
    </div>
  );
}

export function ProductExperience() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [20, -20]);

  return (
    <section
      ref={ref}
      className="px-4 py-20 sm:px-6 lg:px-8"
      aria-labelledby="experience-heading"
    >
      <div className="mx-auto max-w-6xl">
        <AnimatedSection className="text-center">
          <h2 id="experience-heading" className="text-section-heading font-semibold">
            A Panchangam experience designed for today.
          </h2>
        </AnimatedSection>

        <div className="mt-12 grid gap-8 sm:grid-cols-2">
          {views.map((view, i) => (
            <AnimatedSection key={view.title} delay={i * 0.1}>
              <motion.div style={{ y: i % 2 === 1 && !reduced ? y : 0 }}>
                <div className="flex min-h-[320px] flex-col rounded-2xl border border-border bg-card-muted p-6">
                  <h3 className="text-lg font-semibold">{view.title}</h3>
                  <p className="mt-1 text-sm text-muted">{view.description}</p>
                  <div className="mt-6 flex flex-1 items-center justify-center">
                    <MockPanel type={view.content} />
                  </div>
                </div>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
