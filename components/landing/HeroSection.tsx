"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PanchangamCard } from "@/components/panchangam/PanchangamCard";
import { Button } from "@/components/ui/button";
import { todaysPanchangam } from "@/lib/mock-panchangam";
import {
  fadeUp,
  floatAnimation,
  getTransition,
  staggerContainer,
  useReducedMotion,
} from "@/lib/motion";

export function HeroSection() {
  const reduced = useReducedMotion();

  return (
    <section className="hero-gradient relative overflow-hidden px-4 pb-20 pt-12 sm:px-6 lg:px-8 lg:pb-28 lg:pt-20">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <motion.div
          variants={staggerContainer}
          initial={reduced ? false : "hidden"}
          animate={reduced ? false : "visible"}
        >
          <motion.p
            variants={fadeUp}
            transition={getTransition(reduced)}
            className="text-sm font-medium uppercase tracking-wider text-accent"
          >
            Know today. Plan ahead.
          </motion.p>
          <motion.h1
            variants={fadeUp}
            transition={getTransition(reduced, 0.5)}
            className="text-hero mt-4 font-semibold tracking-tight"
          >
            Today&apos;s Panchangam, beautifully simplified.
          </motion.h1>
          <motion.p
            variants={fadeUp}
            transition={getTransition(reduced, 0.6)}
            className="text-subheading mt-6 max-w-xl text-muted"
          >
            Everything you need to know about today, in one clear and peaceful
            experience.
          </motion.p>
          <motion.p
            variants={fadeUp}
            transition={getTransition(reduced, 0.7)}
            className="mt-4 max-w-xl text-muted"
          >
            Check today&apos;s Tithi, Nakshatra, timings, festivals, and more.
            Need another date? Premium lets you explore beyond today.
          </motion.p>
          <motion.div
            variants={fadeUp}
            transition={getTransition(reduced, 0.8)}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Button asChild size="lg">
              <Link href="/today">View Today&apos;s Panchangam</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="#premium">Explore Premium</Link>
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          className="flex justify-center lg:justify-end"
          animate={reduced ? undefined : floatAnimation}
        >
          <PanchangamCard data={todaysPanchangam} variant="hero" />
        </motion.div>
      </div>
    </section>
  );
}
