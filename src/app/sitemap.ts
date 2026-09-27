import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  return [{ url: origin, changeFrequency: "monthly", priority: 1 }, { url: `${origin}/assistant`, changeFrequency: "monthly", priority: 0.8 }];
}
