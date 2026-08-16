import { AnimatedSection } from "@/components/AnimatedSection";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqItems } from "@/lib/landing-content";

export function FAQSection() {
  return (
    <section id="faq" className="px-4 py-20 sm:px-6 lg:px-8" aria-labelledby="faq-heading">
      <div className="mx-auto max-w-3xl">
        <AnimatedSection className="text-center">
          <h2 id="faq-heading" className="text-section-heading font-semibold">
            Frequently asked questions
          </h2>
        </AnimatedSection>

        <AnimatedSection delay={0.1} className="mt-10">
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, i) => (
              <AccordionItem key={item.question} value={`item-${i}`}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </AnimatedSection>
      </div>
    </section>
  );
}
