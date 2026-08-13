import { AnimatedSection } from "@/components/AnimatedSection";
import { ArrowDown } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Open Panchangam",
    description: "Start with today's Panchangam.",
  },
  {
    number: "02",
    title: "Know Your Day",
    description: "See Tithi, Nakshatra, timings, festivals, and more.",
  },
  {
    number: "03",
    title: "Plan Ahead",
    description: "Need another date? Unlock Premium.",
  },
];

const flow = [
  "Today's Panchangam",
  "Explore Today's Details",
  "Need Another Date?",
  "Premium",
];

export function HowItWorks() {
  return (
    <section className="bg-card-muted px-4 py-20 sm:px-6 lg:px-8" aria-labelledby="how-heading">
      <div className="mx-auto max-w-6xl">
        <AnimatedSection className="text-center">
          <h2 id="how-heading" className="text-section-heading font-semibold">
            How it works
          </h2>
        </AnimatedSection>

        <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-6">
            {steps.map((step, i) => (
              <AnimatedSection key={step.title} delay={i * 0.1}>
                <div className="flex gap-4">
                  <span className="text-sm font-semibold text-accent">{step.number}</span>
                  <div>
                    <h3 className="text-lg font-semibold">{step.title}</h3>
                    <p className="mt-1 text-muted">{step.description}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection delay={0.2}>
            <div className="flex flex-col items-center rounded-2xl border border-border bg-card p-8">
              {flow.map((item, i) => (
                <div key={item} className="flex flex-col items-center">
                  <div className="rounded-xl border border-border bg-card-muted px-6 py-3 text-sm font-medium">
                    {item}
                  </div>
                  {i < flow.length - 1 && (
                    <ArrowDown className="my-3 h-4 w-4 text-muted" aria-hidden="true" />
                  )}
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
