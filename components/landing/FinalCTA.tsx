import Link from "next/link";
import { AnimatedSection } from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";

export function FinalCTA() {
  return (
    <section className="bg-dark px-4 py-24 sm:px-6 lg:px-8" aria-labelledby="final-cta-heading">
      <AnimatedSection className="mx-auto max-w-3xl text-center">
        <h2
          id="final-cta-heading"
          className="text-section-heading font-semibold text-white"
        >
          Start with today&apos;s Panchangam.
        </h2>
        <p className="mt-6 text-subheading text-white/70">
          Everything you need to know about today, in one simple place.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/today">View Today&apos;s Panchangam</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="#premium">Explore Premium</Link>
          </Button>
        </div>
      </AnimatedSection>
    </section>
  );
}
