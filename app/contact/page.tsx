import { PageShell } from "@/components/layout/PageShell";
import { pageMetadata } from "@/lib/seo";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Contact",
  description: "Questions or feedback about Panchangam? Get in touch.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-semibold">Contact</h1>
        <p className="mt-4 text-muted leading-relaxed">
          Have questions or feedback? We&apos;d love to hear from you. Reach out at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent hover:underline">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </div>
    </PageShell>
  );
}
