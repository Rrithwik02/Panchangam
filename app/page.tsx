import { SingleLandingPage } from "@/components/landing/SingleLandingPage";
import { todaysPanchangam } from "@/lib/mock-panchangam";
import { getTodayDateForTimezone } from "@/lib/api/panchangam";
import { getPanchangamByDate } from "@/lib/services/panchangam-service";
import { faqItems } from "@/lib/landing-content";
import { jsonLdString, pageMetadata, WEBSITE_ID } from "@/lib/seo";
import { DEFAULT_TIMEZONE, HOME_TITLE, SITE_DESCRIPTION, SITE_URL } from "@/lib/site";

export const metadata = pageMetadata({
  title: HOME_TITLE,
  description: SITE_DESCRIPTION,
  path: "/",
  absoluteTitle: true,
});

// Panchangam data is per-date and changes daily — this page must never be
// statically prerendered, or production would freeze whatever "today" was
// at the last build and serve that snapshot to every visitor forever.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const timezone = DEFAULT_TIMEZONE;
  const location = { latitude: null, longitude: null, timezone };
  const todayDate = getTodayDateForTimezone(timezone) ?? new Date().toISOString().slice(0, 10);

  const todayResult = await getPanchangamByDate(todayDate);
  const initialDay = todayResult.day ?? todaysPanchangam;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/#webpage`,
        url: `${SITE_URL}/`,
        name: HOME_TITLE,
        description: SITE_DESCRIPTION,
        inLanguage: "en-IN",
        isPartOf: { "@id": WEBSITE_ID },
        dateModified: initialDay.date,
      },
      {
        "@type": "FAQPage",
        mainEntity: faqItems.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
      />
      <SingleLandingPage initialDay={initialDay} initialLocation={location} />
    </>
  );
}
