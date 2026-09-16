import type { NextConfig } from "next";

function cdnPatterns() {
  const raw = process.env.NEXT_PUBLIC_IMAGE_CDN_BASE || process.env.IMAGE_CDN_BASE;
  if (!raw) return [];
  try {
    const u = new URL(raw);
    return [
      {
        protocol: (u.protocol.replace(":", "") || "https") as "http" | "https",
        hostname: u.hostname,
        pathname: "/**" as const,
      },
    ];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  agentRules: false,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: cdnPatterns(),
  },
  async redirects() {
    return [{ source: "/support/contact", destination: "/support/inquiry", permanent: false }];
  },
};

export default nextConfig;
