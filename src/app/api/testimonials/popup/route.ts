import { NextResponse } from "next/server";
import { publishedAll } from "@/lib/testimonials-store";
import { findProductBySku } from "@/lib/catalogue";

/**
 * Feed for the site-wide testimonial popup.
 *
 * Only entries Wendy has published with confirmed consent, which is the same
 * gate the product pages use. Each item carries the customer's own words and
 * the product they were talking about; none of it describes a purchase event,
 * because an order is the buyer's private business and a testimonial is not.
 */

/** Keeps the bubble readable without cutting mid-word. */
function excerpt(text: string, max = 120): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 60 ? lastSpace : max).trimEnd()}…`;
}

export async function GET() {
  try {
    const items = await publishedAll();

    const resolved = await Promise.all(
      items.slice(0, 30).map(async (t) => {
        const product = await findProductBySku(t.productSku);
        if (!product?.is_published) return null;

        return {
          id: t.id,
          name: t.displayName,
          text: excerpt(t.text),
          product: product.name,
          slug: product.slug,
          date: t.testimonialDate ?? null,
        };
      })
    );

    return NextResponse.json(
      { items: resolved.filter(Boolean) },
      // Shared cache: this is identical for every visitor and changes only
      // when she publishes something, so it should not hit storage per view.
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" } }
    );
  } catch (err) {
    console.error("Could not build the testimonial feed:", err);
    // An empty feed hides the popup, which is the right failure here.
    return NextResponse.json({ items: [] }, { status: 200 });
  }
}
