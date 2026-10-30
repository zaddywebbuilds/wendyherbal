import { PRODUCTS } from "./products";
import { loadOverlay, type CatalogueOverlay } from "./catalogue-store";
import type { Product } from "./types";

/**
 * The catalogue the site actually serves: products from code with the owner's
 * admin edits applied on top, plus anything she has added herself.
 *
 * Reads are cached and tagged, so product pages stay prerendered and a single
 * `revalidateCatalogue()` after an admin save refreshes every page that shows
 * a product. Without that, each page view would cost a storage round trip.
 */

export const CATALOGUE_TAG = "catalogue";

function applyPatch(product: Product, overlay: CatalogueOverlay): Product {
  const patch = overlay.patches[product.sku];
  if (!patch) return product;

  // Only fields present in the patch are changed. An absent key means "leave
  // what the code says", which is what lets an edit be undone by clearing it.
  const next: Product = { ...product };
  if (patch.name !== undefined) next.name = patch.name;
  if (patch.description !== undefined) next.description = patch.description;
  if (patch.category !== undefined) next.category = patch.category;
  if (patch.price !== undefined) next.price = patch.price;
  if (patch.images !== undefined) next.images = patch.images;
  if (patch.in_stock !== undefined) next.in_stock = patch.in_stock;
  if (patch.stock_count !== undefined) next.stock_count = patch.stock_count;
  if (patch.is_published !== undefined) next.is_published = patch.is_published;
  if (patch.ingredients !== undefined) next.ingredients = patch.ingredients;
  if (patch.storage_info !== undefined) next.storage_info = patch.storage_info;

  // A product with no published price cannot go through the cart.
  next.is_enquiry_only = next.price === null;
  return next;
}

function merge(overlay: CatalogueOverlay): Product[] {
  const coded = PRODUCTS.map((p) => applyPatch(p, overlay));

  const removed = new Set(overlay.removed);
  const created = overlay.created
    .filter((p) => !removed.has(p.sku))
    .map((p) => applyPatch(p as Product, overlay));

  // Newest additions first among created items, then the coded catalogue in
  // its source order, which follows the client's own price list numbering.
  return [...created, ...coded];
}

/** Uncached read. Use inside admin writes, where a stale copy would be wrong. */
export async function getCatalogueFresh(): Promise<Product[]> {
  return merge(await loadOverlay());
}

/**
 * The catalogue for everything the public sees. Deliberately uncached.
 *
 * Two caching attempts were made and both were removed. unstable_cache and
 * the "use cache" directive each left a product page serving an old price
 * while /api/orders charged the new one, because neither revalidateTag nor
 * revalidatePath reliably purged the entry from a route handler in this Next
 * version. Showing one price and charging another is the single worst thing
 * this shop could do, so the read is now a plain one on every render: one
 * small KV GET, against a catalogue that is a few kilobytes.
 *
 * The pages that call this therefore declare themselves dynamic. If this ever
 * needs to scale, re-add a cache only once an invalidation path is proven
 * end to end against a deployed build, not in dev.
 */
export async function getCatalogue(): Promise<Product[]> {
  return merge(await loadOverlay());
}

export async function getPublishedCatalogue(): Promise<Product[]> {
  return (await getCatalogue()).filter((p) => p.is_published);
}

export async function findProduct(slug: string): Promise<Product | undefined> {
  return (await getCatalogue()).find((p) => p.slug === slug);
}

export async function findProductBySku(sku: string): Promise<Product | undefined> {
  return (await getCatalogue()).find((p) => p.sku === sku);
}

/** Five products for the homepage row, falling back as the catalogue changes. */
export async function getFeaturedProducts(n = 5): Promise<Product[]> {
  const all = await getPublishedCatalogue();
  const preferred = [
    "ovarian-cyst-herbs-with-balm", "pcos-herbs-with-balm", "fibroid-herbs-with-balm",
    "sperm-booster-herbs", "hyper-ovulation-booster-herbs-for-twins",
  ];

  const picked = preferred
    .map((slug) => all.find((p) => p.slug === slug))
    .filter((p): p is Product => Boolean(p));

  // If a featured product has been unpublished, top up rather than show a gap.
  for (const p of all) {
    if (picked.length >= n) break;
    if (!picked.includes(p)) picked.push(p);
  }
  return picked.slice(0, n);
}
