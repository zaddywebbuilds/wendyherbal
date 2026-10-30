import type { MetadataRoute } from "next";
import { PRODUCTS, CATEGORY_LABELS } from "@/lib/products";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
  if (!base) return [];

  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/shop`, changeFrequency: "weekly", priority: 0.9 },

    ...Object.keys(CATEGORY_LABELS).map((c) => ({
      url: `${base}/shop?category=${c}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),

    ...PRODUCTS.filter((p) => p.is_published).map((p) => ({
      url: `${base}/product/${p.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
