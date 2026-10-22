// Single source of truth for the public site identity. Set NEXT_PUBLIC_SITE_URL
// to switch domains (canonicals, sitemap, Open Graph and JSON-LD all follow it).
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://epanchangam.vercel.app").replace(/\/+$/, "");

export const SITE_NAME = "Panchangam";

export const CONTACT_EMAIL = "epanchangam.official@gmail.com";

// Google Search Console ownership token (HTML-tag method).
export const GOOGLE_SITE_VERIFICATION = "XBRmzE1kM1RSFR6z4XoxTm_JYiD0rCA3OM6HW0y1dbI";

export const HOME_TITLE = "Today's Panchangam – Tithi, Nakshatra, Rahu Kalam";

export const SITE_DESCRIPTION =
  "Today's Panchangam with Tithi, Nakshatra, Yoga, Karana, Rahu Kalam, Yamagandam, sunrise and sunset. A free daily Hindu calendar, updated every day.";

// The server has no visitor timezone. Rendering "today" in UTC would show the
// previous date to crawlers (and to anyone before 05:30 IST), so server-side
// rendering uses India time; the client refetches when the visitor's differs.
export const DEFAULT_TIMEZONE = "Asia/Kolkata";
