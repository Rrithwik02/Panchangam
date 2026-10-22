import type { Metadata } from "next";
import { CONTACT_EMAIL, SITE_NAME, SITE_URL } from "@/lib/site";

interface PageMetadataInput {
  title: string;
  description: string;
  /** Canonical path, e.g. "/about". */
  path: string;
  /** Use the title as-is instead of applying the "%s | Panchangam" template. */
  absoluteTitle?: boolean;
  index?: boolean;
}

const SOCIAL_IMAGE = "/opengraph-image";

// A page-level `openGraph` replaces the root one wholesale, so every field
// (including the image) is set here; otherwise pages would lose siteName,
// locale and the social image, or inherit the wrong URL.
export function pageMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
  index = true,
}: PageMetadataInput): Metadata {
  const fullTitle = absoluteTitle ? title : `${title} | ${SITE_NAME}`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    robots: index ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: {
      title: fullTitle,
      description,
      url: path,
      siteName: SITE_NAME,
      locale: "en_IN",
      type: "website",
      images: [{ url: SOCIAL_IMAGE, width: 1200, height: 630, alt: SITE_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [SOCIAL_IMAGE],
    },
  };
}

export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

export function siteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": ORGANIZATION_ID,
        name: SITE_NAME,
        url: SITE_URL,
        email: CONTACT_EMAIL,
        contactPoint: { "@type": "ContactPoint", contactType: "customer support", email: CONTACT_EMAIL },
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        name: SITE_NAME,
        url: SITE_URL,
        inLanguage: "en-IN",
        publisher: { "@id": ORGANIZATION_ID },
      },
    ],
  };
}

/** Serialises JSON-LD for a <script> tag; "<" is escaped so content can never close the tag. */
export function jsonLdString(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
