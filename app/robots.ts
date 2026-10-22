import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Crawlers (including AI search bots) are allowed by default under "*".
// Per-bot groups would need to repeat these disallows, so none are added.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/api/openapi"],
      disallow: ["/api/", "/account/", "/auth/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
