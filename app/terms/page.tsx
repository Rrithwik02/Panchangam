import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { pageMetadata } from "@/lib/seo";
import { CONTACT_EMAIL } from "@/lib/site";
import { API_PLAN, PLANS, SUPPORTED_RANGE } from "@/lib/billing/plans";

export const metadata = pageMetadata({
  title: "Terms & Conditions",
  description:
    "The terms for using Panchangam: accounts, Free, Pro and API plans, acceptable use, and how we treat Panchangam accuracy.",
  path: "/terms",
});

const h2 = "mt-10 text-xl font-semibold";
const p = "mt-3 text-muted leading-relaxed";
const ul = "mt-3 list-disc space-y-1.5 pl-5 text-muted leading-relaxed";

export default function TermsPage() {
  return (
    <PageShell>
      <article className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-semibold">Terms &amp; Conditions</h1>
        <p className="mt-2 text-sm text-muted">
          Last updated: <time dateTime="2026-10-22">22 October 2026</time>
        </p>
        <p className={p}>
          By using Panchangam (the website and its API) you agree to these terms. If you do not agree,
          please do not use the service.
        </p>

        <h2 className={h2}>The service</h2>
        <p className={p}>
          Panchangam provides a daily Hindu calendar: Tithi, Vara, Nakshatra, Yoga, Karana, sunrise and
          sunset, auspicious and inauspicious timings, and festivals, for dates from{" "}
          {SUPPORTED_RANGE.start} to {SUPPORTED_RANGE.end}. Read our{" "}
          <Link href="/about" className="text-accent hover:underline">About</Link> page for what is included.
        </p>

        <h2 className={h2}>Accuracy and how to use the information</h2>
        <ul className={ul}>
          <li>
            The Panchangam is provided for general information. We work to keep it accurate but do not
            guarantee that it is free of errors.
          </li>
          <li>
            Festival dates here follow the Tithi at sunrise. Other calendars may use a different rule for
            some festivals, so dates can differ by a day. Please confirm important religious dates with
            your priest or local tradition.
          </li>
          <li>
            The Panchangam is not medical, legal, financial or travel-safety advice. Please do not rely on
            it for decisions where a mistake could cause harm.
          </li>
        </ul>

        <h2 className={h2}>Accounts</h2>
        <p className={p}>
          You need an account for some features. Give accurate details, keep your password and API keys
          confidential, and tell us if you think your account has been misused. You are responsible for
          activity under your account.
        </p>

        <h2 className={h2}>Plans and payments</h2>
        <ul className={ul}>
          <li>
            <strong>Free</strong> (₹0): today&apos;s and yesterday&apos;s full Panchangam and a preview of
            tomorrow.
          </li>
          <li>
            <strong>{PLANS.pro.name}</strong> (₹{PLANS.pro.priceInr} per month): tomorrow in full and any
            date in the supported range.
          </li>
          <li>
            <strong>{API_PLAN.name}</strong> (₹{API_PLAN.priceInr} per month): access to the JSON API. It
            is separate from Pro, and Pro does not include API access.
          </li>
        </ul>
        <p className={p}>
          Paid plans run for a billing period and do not include any other benefit unless stated on the
          site. If you cancel, you keep access until the end of the period you have already paid for, and
          the plan does not renew. Prices and features may change; we will not change the price of a
          period you have already paid for. For questions about a charge, email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent hover:underline">
            {CONTACT_EMAIL}
          </a>
          .
        </p>

        <h2 className={h2}>Acceptable use</h2>
        <ul className={ul}>
          <li>Do not attack, overload or try to get around the limits or security of the service.</li>
          <li>
            Do not scrape or bulk-download the data from the website. If you need the data in volume, use
            the <Link href="/docs" className="text-accent hover:underline">API</Link>.
          </li>
          <li>
            Use API keys only within the published limits, keep them private, and do not share one key
            between unrelated users or applications. We monitor for key sharing and may tighten limits or
            suspend a key that is misused.
          </li>
          <li>Do not use the service for anything unlawful.</li>
        </ul>

        <h2 className={h2}>Our content</h2>
        <p className={p}>
          The site, its design and the way the data is compiled belong to us or our licensors. You may
          use the Panchangam for your own personal purposes. You may not republish or resell it without
          our written permission, except as the API plan allows.
        </p>

        <h2 className={h2}>Availability and liability</h2>
        <p className={p}>
          We aim to keep the service running but may change, pause or discontinue any part of it. The
          service is provided &ldquo;as is&rdquo;. To the extent the law allows, we are not liable for
          indirect or consequential losses, or for loss arising from relying on the Panchangam. Nothing
          in these terms limits any right you have that cannot be limited by law.
        </p>

        <h2 className={h2}>Ending your use</h2>
        <p className={p}>
          You may stop using the service at any time and can ask us to delete your account. We may
          suspend or close accounts that break these terms.
        </p>

        <h2 className={h2}>Changes and governing law</h2>
        <p className={p}>
          We may update these terms and will change the date above when we do. Continuing to use the
          service means you accept the updated terms. These terms are governed by the laws of India.
        </p>

        <h2 className={h2}>Contact</h2>
        <p className={p}>
          Questions about these terms:{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent hover:underline">
            {CONTACT_EMAIL}
          </a>
          . See also our <Link href="/privacy" className="text-accent hover:underline">Privacy Policy</Link>.
        </p>
      </article>
    </PageShell>
  );
}
