import type { Metadata, Viewport } from "next";
import { ClientProviders } from "@/components/providers/ClientProviders";
import { GOOGLE_SITE_VERIFICATION, HOME_TITLE, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { jsonLdString, siteJsonLd } from "@/lib/seo";
import "./globals.css";

// No root-level canonical on purpose: a layout canonical would be inherited by
// every page that doesn't set its own and point them all at the homepage.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: HOME_TITLE, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    siteName: SITE_NAME,
    locale: "en_IN",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
  robots: {
    index: true,
    follow: true,
  },
  verification: { google: GOOGLE_SITE_VERIFICATION },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f5" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0d13" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-IN"
      data-theme="light"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col font-sans">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdString(siteJsonLd()) }}
        />
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
