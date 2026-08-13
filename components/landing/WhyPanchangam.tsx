"use client";

import { ScrollReveal } from "@/components/ScrollReveal";

const cards = [
  {
    number: "01",
    title: "Clear",
    description:
      "All important Panchangam information organized so you can understand it quickly.",
  },
  {
    number: "02",
    title: "Complete",
    description:
      "From Tithi and Nakshatra to Rahu Kalam, festivals, and special timings.",
  },
  {
    number: "03",
    title: "Simple",
    description:
      "No confusing navigation. No unnecessary clutter. Just the information you need.",
  },
];

export function WhyPanchangam() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8" aria-labelledby="why-heading">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal className="text-center">
          <h2 id="why-heading" className="text-section-heading font-semibold">
            Traditional knowledge. Modern experience.
          </h2>
        </ScrollReveal>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {cards.map((card, i) => (
            <ScrollReveal key={card.title} delay={i * 0.08}>
              <div className="group h-full rounded-2xl border border-border bg-card p-8 transition-all duration-500 hover:-translate-y-1 hover:border-accent/40 hover:shadow-xl hover:shadow-dark/5">
                <span className="text-sm font-semibold tabular-nums text-accent">
                  {card.number}
                </span>
                <h3 className="mt-4 text-xl font-semibold">{card.title}</h3>
                <p className="mt-3 leading-relaxed text-muted">{card.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
