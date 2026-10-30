import type { MetadataRoute } from "next";
import { PRODUCTS, CATEGORY_LABELS } from "@/lib/products";

/** Written pages. Low churn, so they sit at a yearly change frequency. */
const CONTENT_PAGES = [
  "/about",
  "/contact",
  "/faq",
  "/delivery",
  "/returns",
  "/privacy",
  "/terms",
  "/disclaimer",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
  if (!base) return [];

  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/shop`, changeFrequency: "weekly", priority: 0.9 },

    ...CONTENT_PAGES.map((path) => ({
      url: `${base}${path}`,
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),

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
