import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://panchangam.app";

export const metadata: Metadata = {
  title: "Panchangam — Today's Panchangam, Beautifully Simplified",
  description:
    "Check today's Panchangam with Tithi, Nakshatra, Rahu Kalam, sunrise, festivals, and more. Free for today. Premium unlocks any date.",
  keywords: [
    "today's panchangam",
    "panchangam today",
    "hindu panchangam",
    "tithi today",
    "nakshatra today",
    "rahu kalam today",
    "telugu panchangam",
  ],
  openGraph: {
    title: "Panchangam — Today's Panchangam, Beautifully Simplified",
    description:
      "Everything you need to know about today, in one clear and peaceful experience.",
    url: siteUrl,
    siteName: "Panchangam",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Panchangam — Today's Panchangam, Beautifully Simplified",
    description:
      "Check today's Tithi, Nakshatra, timings, festivals, and more.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: "Panchangam",
      url: siteUrl,
      description:
        "Today's Panchangam, beautifully simplified. Free daily Panchangam with Premium for any date.",
    },
    {
      "@type": "Organization",
      name: "Panchangam",
      url: siteUrl,
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
