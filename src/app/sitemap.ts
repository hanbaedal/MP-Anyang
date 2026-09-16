import type { MetadataRoute } from "next";
import { NAV, siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const url = siteUrl();
  if (!url) return [];

  const paths = new Set<string>(["/", "/gallery", "/privacy"]);
  for (const item of NAV) {
    paths.add(item.href);
    item.children?.forEach((child) => paths.add(child.href));
  }

  return [...paths].map((path) => ({
    url: `${url}${path}`,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
