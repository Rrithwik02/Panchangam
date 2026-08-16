import Link from "next/link";
import { SunMoonTimingsBar } from "@/components/celestial/SunMoonTimingsBar";
import { LocationAwarePanchangam } from "@/components/panchangam/LocationAwarePanchangam";
import { Button } from "@/components/ui/button";
import { todaysPanchangam } from "@/lib/mock-panchangam";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Today's Panchangam",
  description:
    "View today's complete Panchangam including Tithi, Nakshatra, timings, and festivals.",
};

export default function TodayPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="font-semibold transition-opacity hover:opacity-80">
            ← Panchangam
          </Link>
          <Button asChild variant="secondary" size="sm">
            <Link href="/premium">Explore Premium</Link>
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold tracking-tight">
          Today&apos;s Panchangam
        </h1>
        <p className="mt-2 text-muted">
          Complete Panchangam for {todaysPanchangam.dateLabel}
        </p>

        <div className="mt-8">
          <div className="-mx-4 sm:mx-0">
            <SunMoonTimingsBar />
          </div>
        </div>

        <div className="mt-10">
          <LocationAwarePanchangam data={todaysPanchangam} />
        </div>
      </main>
    </div>
  );
}
