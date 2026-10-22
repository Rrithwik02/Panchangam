import { ChevronDown } from "lucide-react";
import { faqItems } from "@/lib/landing-content";

// Native <details> keeps every answer in the server-rendered HTML (crawlers and
// AI bots read it) and works without JavaScript. The FAQPage JSON-LD on the
// homepage is built from the same faqItems, so markup always matches the page.
export function FAQSection() {
  return (
    <section id="faq" className="px-4 py-16 sm:py-20 sm:px-6 lg:px-8 border-b border-border/60" aria-labelledby="faq-heading">
      <div className="mx-auto max-w-3xl">
        <h2 id="faq-heading" className="text-center text-section-heading font-semibold">
          Frequently asked questions
        </h2>

        <div className="mt-10">
          {faqItems.map((item) => (
            <details key={item.question} className="group border-b border-border">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left text-base font-medium transition-colors hover:text-accent [&::-webkit-details-marker]:hidden">
                <h3 className="text-base font-medium">{item.question}</h3>
                <ChevronDown
                  className="h-4 w-4 shrink-0 text-muted transition-transform duration-300 group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <p className="pb-5 text-sm leading-relaxed text-muted">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
