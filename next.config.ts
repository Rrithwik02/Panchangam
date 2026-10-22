import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // /today and /premium used to render the same page as "/" (duplicate content).
  // One URL per page: consolidate into "/" and keep old links working.
  async redirects() {
    return [
      { source: "/today", destination: "/", permanent: true },
      { source: "/premium", destination: "/#premium", permanent: true },
    ];
  },
};

export default nextConfig;
