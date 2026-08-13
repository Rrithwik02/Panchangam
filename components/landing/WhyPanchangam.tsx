import { AnimatedSection } from "@/components/AnimatedSection";

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
        <AnimatedSection className="text-center">
          <h2 id="why-heading" className="text-section-heading font-semibold">
            Traditional knowledge. Modern experience.
          </h2>
        </AnimatedSection>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {cards.map((card, i) => (
            <AnimatedSection key={card.title} delay={i * 0.1}>
              <div className="group h-full rounded-2xl border border-border bg-card p-8 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-lg hover:shadow-dark/5">
                <span className="text-sm font-semibold text-accent">{card.number}</span>
                <h3 className="mt-4 text-xl font-semibold">{card.title}</h3>
                <p className="mt-3 text-muted">{card.description}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
