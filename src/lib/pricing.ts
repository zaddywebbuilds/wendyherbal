import type { Product, CartItem } from "./types";

/**
 * The price of one unit, taking the chosen size into account.
 *
 * Everything that shows or charges a price goes through here: the product
 * page, the cart, the checkout summary, the WhatsApp message and the order
 * endpoint. Keeping it in one function is what stops the shop displaying one
 * figure and charging another, which is the failure this project has already
 * had once with caching.
 */
export function unitPrice(product: Product, variantId?: string): number | null {
  if (product.variants?.length) {
    const chosen = variantId
      ? product.variants.find((v) => v.id === variantId)
      : undefined;
    if (chosen) return chosen.price;
    // No size chosen yet: quote the cheapest, which is what "from" means.
    return Math.min(...product.variants.map((v) => v.price));
  }
  return product.price;
}

export const variantLabel = (product: Product, variantId?: string): string | null =>
  product.variants?.find((v) => v.id === variantId)?.label ?? null;

export const lineTotal = (item: CartItem): number =>
  (unitPrice(item.product, item.size) ?? 0) * item.quantity;

/** True when the product needs a size picked before it can be added. */
export const needsVariantChoice = (product: Product): boolean =>
  Boolean(product.variants?.length);
