import { AnimatedSection } from "@/components/AnimatedSection";
import { RefreshCw } from "lucide-react";

export function DailyUpdateBanner() {
  return (
    <section className="border-y border-border bg-card-muted px-4 py-10 sm:px-6 lg:px-8">
      <AnimatedSection className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <div className="flex items-center gap-2 text-accent">
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          <span className="text-sm font-semibold uppercase tracking-wider">
            Updated every day.
          </span>
        </div>
        <p className="mt-3 text-subheading text-muted">
          Start each day with the Panchangam that matters to you.
        </p>
      </AnimatedSection>
    </section>
  );
}
