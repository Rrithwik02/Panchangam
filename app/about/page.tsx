import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { pageMetadata } from "@/lib/seo";
import { SUPPORTED_RANGE } from "@/lib/billing/plans";

export const metadata = pageMetadata({
  title: "About Panchangam – What It Is and How It Works",
  description:
    "Panchangam is a free daily Hindu calendar showing Tithi, Nakshatra, Yoga, Karana, Rahu Kalam and festivals. Learn what it shows and how festival dates are decided.",
  path: "/about",
  absoluteTitle: true,
});

export default function AboutPage() {
  return (
    <PageShell>
      <article className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-semibold">About Panchangam</h1>
        <p className="mt-4 text-muted leading-relaxed">
          A Panchangam is the traditional Hindu almanac. For every day it lists five elements, or
          &ldquo;limbs&rdquo;: Tithi (lunar day), Vara (weekday), Nakshatra (star), Yoga and Karana. It
          also gives the daily timings people check before travel, puja and new beginnings, such as
          Rahu Kalam, Yamagandam, Gulika Kalam and Abhijit Muhurtham.
        </p>
        <p className="mt-4 text-muted leading-relaxed">
          This site makes that information clear, complete and calm — not cluttered or confusing. It is
          built so anyone can read today&apos;s Panchangam in seconds.
        </p>

        <h2 className="mt-10 text-xl font-semibold">What you get</h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-muted leading-relaxed">
          <li>Today&apos;s and yesterday&apos;s full Panchangam, free, with sunrise, sunset, moonrise and moonset.</li>
          <li>Rahu Kalam, Yamagandam, Gulika Kalam, Durmuhurtham, Varjyam, Brahma Muhurtham, Abhijit Muhurtham and Amrita Kalam.</li>
          <li>
            Tomorrow in full and any date from {SUPPORTED_RANGE.start.slice(0, 4)} to {SUPPORTED_RANGE.end.slice(0, 4)} with{" "}
            <Link href="/upgrade" className="text-accent hover:underline">Pro</Link>.
          </li>
          <li>
            A JSON <Link href="/docs" className="text-accent hover:underline">API</Link> for developers and apps.
          </li>
        </ul>

        <h2 className="mt-10 text-xl font-semibold">How festival dates are decided</h2>
        <p className="mt-3 text-muted leading-relaxed">
          Festivals here follow the Tithi that prevails at sunrise on that day. Some other calendars
          apply a different rule for certain festivals, for example the Tithi during a particular
          observance window, so a festival can fall one day apart from another source. For rituals,
          please confirm the date with your family priest or local tradition.
        </p>

        <p className="mt-10 text-muted leading-relaxed">
          Questions or feedback? <Link href="/contact" className="text-accent hover:underline">Get in touch</Link>.
        </p>
      </article>
    </PageShell>
  );
}
