"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatedSection } from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { premiumBenefits } from "@/lib/landing-content";
import type { DateAccessItem, PanchangamDay } from "@/lib/types/panchangam";
import { Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

function AccessIcon({ access }: { access: DateAccessItem["access"] }) {
  if (access === "locked") {
    return <Lock className="h-4 w-4 text-gold" aria-hidden="true" />;
  }
  return <Check className="h-4 w-4 text-accent" aria-hidden="true" />;
}

export function PremiumPaywallModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Explore Panchangam for Any Date</DialogTitle>
          <DialogDescription>
            Unlock complete Panchangam information for past and future dates.
          </DialogDescription>
        </DialogHeader>
        <ul className="space-y-3 py-2">
          {premiumBenefits.map((benefit) => (
            <li key={benefit} className="flex items-start gap-3 text-sm">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              {benefit}
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-2 pt-2">
          <Button asChild>
            <Link href="/premium" onClick={() => onOpenChange(false)}>
              Unlock Premium
            </Link>
          </Button>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function createDateAccessItems(today: PanchangamDay, tomorrow: PanchangamDay) {
  const baseDate = new Date(`${today.date}T00:00:00Z`);
  const offsetDate = (offset: number) => {
    const date = new Date(baseDate);
    date.setUTCDate(date.getUTCDate() + offset);
    return date.toISOString().slice(0, 10);
  };
  const formatShortDate = (date: string) =>
    new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
    }).format(new Date(`${date}T00:00:00Z`));

  return [
    { label: "Today", date: today.date, access: "full" as const },
    { label: "Yesterday", date: offsetDate(-1), access: "full" as const },
    {
      label: "Tomorrow",
      date: tomorrow.date,
      access: "preview" as const,
      previewFields: ["Tithi", "Vara", "Nakshatra"],
    },
    { label: formatShortDate(offsetDate(2)), date: offsetDate(2), access: "locked" as const },
    { label: formatShortDate(offsetDate(3)), date: offsetDate(3), access: "locked" as const },
    { label: formatShortDate(offsetDate(4)), date: offsetDate(4), access: "locked" as const },
  ];
}

export function DateAccessDemo({
  todayData,
  tomorrowData,
}: {
  todayData: PanchangamDay;
  tomorrowData: PanchangamDay;
}) {
  const [modalOpen, setModalOpen] = useState(false);

  const handleRowClick = (item: DateAccessItem) => {
    if (item.access === "locked") {
      setModalOpen(true);
    }
  };

  return (
    <section className="bg-card-muted px-4 py-20 sm:px-6 lg:px-8" aria-labelledby="paywall-heading">
      <div className="mx-auto max-w-2xl">
        <AnimatedSection className="text-center">
          <h2 id="paywall-heading" className="text-section-heading font-semibold">
            See how access works
          </h2>
          <p className="mt-4 text-muted">
            Today and yesterday are fully open. Tomorrow gives you a preview. Other
            dates unlock with Premium.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.15}>
          <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-card">
            {createDateAccessItems(todayData, tomorrowData).map((item) => (
              <button
                key={`${item.label}-${item.date}`}
                type="button"
                onClick={() => handleRowClick(item)}
                disabled={item.access !== "locked"}
                className={cn(
                  "flex w-full items-center justify-between border-b border-border px-6 py-4 text-left transition-colors last:border-0",
                  item.access === "locked" &&
                    "cursor-pointer hover:bg-card-muted focus-visible:bg-card-muted",
                  item.access !== "locked" && "cursor-default"
                )}
              >
                <div>
                  <p className="font-medium">{item.label}</p>
                  {item.access === "preview" && (
                    <p className="mt-0.5 text-xs text-muted">
                      {tomorrowData.tithi} · {tomorrowData.vara} ·{" "}
                      {tomorrowData.nakshatra}
                    </p>
                  )}
                  {item.access === "full" && (
                    <p className="mt-0.5 text-xs text-muted">Full Panchangam</p>
                  )}
                  {item.access === "locked" && (
                    <p className="mt-0.5 text-xs text-muted">Premium required</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {item.access === "preview" && (
                    <span className="text-xs text-muted">Limited Preview</span>
                  )}
                  {item.access === "full" && (
                    <span className="text-xs text-accent">Full</span>
                  )}
                  {item.access === "locked" && (
                    <span className="text-xs text-gold">Premium</span>
                  )}
                  <AccessIcon access={item.access} />
                </div>
              </button>
            ))}
          </div>
        </AnimatedSection>
      </div>

      <PremiumPaywallModal open={modalOpen} onOpenChange={setModalOpen} />
    </section>
  );
}
