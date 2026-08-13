import { AnimatedSection } from "@/components/AnimatedSection";
import { PanchangamCard } from "@/components/panchangam/PanchangamCard";
import { todaysPanchangam } from "@/lib/mock-panchangam";

export function DailyHabitSection() {
  return (
    <section className="bg-dark px-4 py-20 sm:px-6 lg:px-8" aria-labelledby="habit-heading">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <AnimatedSection>
          <h2 id="habit-heading" className="text-section-heading font-semibold text-white">
            A better way to start your day.
          </h2>
          <p className="mt-6 text-subheading text-white/70">
            Make Panchangam part of your morning routine. Open once, know what&apos;s
            important, and get on with your day.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.15}>
          <PanchangamCard data={todaysPanchangam} variant="compact" />
        </AnimatedSection>
      </div>
    </section>
  );
}
