import type { MetadataRoute } from "next";

/**
 * Search engines are blocked until the site is actually ready to launch.
 *
 * Right now About, Contact, FAQ and — most importantly — the Medical
 * Disclaimer all 404, products have no photography, and the catalogue has had
 * no NAFDAC review. Letting Google index herbal products named after medical
 * conditions in that state is a real risk, and de-indexing afterwards is slow.
 *
 * Flip NEXT_PUBLIC_ALLOW_INDEXING=true when those are done.
 */
export default function robots(): MetadataRoute.Robots {
  const allowIndexing = process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";
  const base = process.env.NEXT_PUBLIC_SITE_URL;

  if (!allowIndexing) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/checkout"] }],
    ...(base ? { sitemap: `${base}/sitemap.xml` } : {}),
  };
}
