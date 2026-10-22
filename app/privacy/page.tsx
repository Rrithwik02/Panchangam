import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { pageMetadata } from "@/lib/seo";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "What personal information Panchangam collects, why, who we share it with, and how you can access, correct or delete it.",
  path: "/privacy",
});

const h2 = "mt-10 text-xl font-semibold";
const p = "mt-3 text-muted leading-relaxed";
const ul = "mt-3 list-disc space-y-1.5 pl-5 text-muted leading-relaxed";

export default function PrivacyPage() {
  return (
    <PageShell>
      <article className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-semibold">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted">
          Last updated: <time dateTime="2026-10-22">22 October 2026</time>
        </p>
        <p className={p}>
          This policy explains what personal information Panchangam (&ldquo;we&rdquo;, &ldquo;us&rdquo;)
          collects when you use this website and its API, why we collect it, and the choices you have.
          If you have any question, write to{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent hover:underline">
            {CONTACT_EMAIL}
          </a>
          .
        </p>

        <h2 className={h2}>Using the site without an account</h2>
        <p className={p}>
          You can read today&apos;s and yesterday&apos;s Panchangam without signing up. We do not run
          advertising or third-party analytics scripts on the site.
        </p>

        <h2 className={h2}>Information we collect</h2>
        <ul className={ul}>
          <li>
            <strong>Account details.</strong> If you create an account: your name, your email address and
            your password. Passwords are handled by our sign-in provider and are stored only in hashed
            form; we never see or store your password in plain text.
          </li>
          <li>
            <strong>Plan and billing status.</strong> Which plan you have (Free, Pro or API), its status
            and its billing period. When online payments are enabled they are processed by a third-party
            payment gateway, and we do not store your card or UPI details.
          </li>
          <li>
            <strong>Location.</strong> If you allow it, your browser shares your approximate position so
            the site can show your city and timezone. You can refuse this and the site still works. We do
            not save your coordinates to your account.
          </li>
          <li>
            <strong>API usage.</strong> If you use the API: your API keys (stored only as one-way hashes),
            and a log of requests with the endpoint, response status, response time, a hashed IP address,
            an approximate country and the user agent. We use this to enforce limits, protect the service
            and show you your usage.
          </li>
          <li>
            <strong>Technical data.</strong> Like any website, our hosting provider processes standard
            request information such as IP address and browser type to deliver the site and keep it
            secure.
          </li>
        </ul>

        <h2 className={h2}>How we use it</h2>
        <ul className={ul}>
          <li>To run your account, sign you in and provide the plan you chose.</li>
          <li>To show the Panchangam for the right date and place.</li>
          <li>To apply rate limits, prevent abuse and key sharing, and keep the service reliable.</li>
          <li>To reply when you contact us.</li>
        </ul>
        <p className={p}>We do not sell your personal information.</p>

        <h2 className={h2}>Cookies</h2>
        <p className={p}>
          We use cookies only to keep you signed in (a session cookie from our sign-in provider) and to
          remember your sign-in between visits. We do not use advertising cookies.
        </p>

        <h2 className={h2}>Who we share it with</h2>
        <p className={p}>We use a small number of service providers to run the site:</p>
        <ul className={ul}>
          <li>
            <strong>Vercel</strong> hosts the website.
          </li>
          <li>
            <strong>Supabase</strong> provides sign-in and our database.
          </li>
          <li>
            <strong>BigDataCloud</strong> turns your browser&apos;s coordinates into a city name. This
            lookup is made directly from your browser, and only if you allow location access.
          </li>
          <li>
            A <strong>payment gateway</strong> processes payments once paid plans are switched on.
          </li>
        </ul>
        <p className={p}>
          They handle data only to provide their service to us. We may also disclose information if the
          law requires it.
        </p>

        <h2 className={h2}>How long we keep it</h2>
        <p className={p}>
          We keep account information while your account exists. API request logs are kept for a limited
          period for security and abuse prevention and are then deleted. You can ask us to delete your
          account and its data at any time.
        </p>

        <h2 className={h2}>Your choices</h2>
        <p className={p}>
          You can ask us to show you the personal information we hold about you, correct it, or delete
          it. You can update your name on your <Link href="/account/profile" className="text-accent hover:underline">profile page</Link>.
          For anything else, email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent hover:underline">
            {CONTACT_EMAIL}
          </a>{" "}
          from the address on your account and we will respond. You can also withdraw location access at
          any time in your browser settings.
        </p>

        <h2 className={h2}>Security</h2>
        <p className={p}>
          We use encrypted connections (HTTPS), hashed passwords and API keys, and access controls on our
          database. No online service can be perfectly secure, so please use a strong, unique password and
          keep your API keys private.
        </p>

        <h2 className={h2}>Children</h2>
        <p className={p}>
          Accounts are meant for people aged 18 and over. If a child has given us personal information,
          contact us and we will delete it.
        </p>

        <h2 className={h2}>Changes to this policy</h2>
        <p className={p}>
          If we change this policy we will update the date at the top. Significant changes will be
          announced on the site.
        </p>

        <p className={p}>
          See also our <Link href="/terms" className="text-accent hover:underline">Terms &amp; Conditions</Link>.
        </p>
      </article>
    </PageShell>
  );
}
