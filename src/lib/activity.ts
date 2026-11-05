import { listOrders, listCustomers } from "./sheets";
import { getCatalogue } from "./catalogue";
import { parseLagosStamp, normalisePhone } from "./sheet-schema";
import { voided, parseItems, matchProduct } from "./order-lines";

/**
 * Recent orders, anonymised, for the storefront activity popup.
 *
 * Every card is a real order from the sheet. Nothing here is generated: with
 * no orders the feed is empty and the popup does not appear, which is the
 * honest state for a shop that has not sold yet.
 *
 * Buyers are never named. "Someone in Lagos" is all a visitor sees, because
 * these are real people and several of these products say something about
 * their health.
 */

/** Older than this is not news, and stale cards read as a dead shop. */
const WINDOW_DAYS = 21;
const MAX_ITEMS = 24;

/**
 * A town is only named once this many orders have come from it. Below that it
 * falls back to the state. In a small town "someone here ordered fertility
 * herbs" can point at a person; "someone in Kaduna" cannot.
 */
const MIN_ORDERS_TO_NAME_A_TOWN = 3;

export interface ActivityItem {
  id: string;
  /** "Lekki, Lagos" or just "Lagos" when the town is too sparse to name. */
  place: string;
  product: string;
  slug: string;
  /** ISO instant, so the browser can render the relative time in its own clock. */
  at: string;
  /** False for rows written before order times were recorded. */
  exactTime: boolean;
}

const titleCase = (s: string) =>
  s.trim().toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase());

export async function getRecentActivity(): Promise<ActivityItem[]> {
  const [orders, customers, catalogue] = await Promise.all([
    listOrders(),
    listCustomers(),
    getCatalogue(),
  ]);

  if (orders.length === 0) return [];

  const byPhone = new Map(customers.map((c) => [normalisePhone(c.phone), c]));
  const cutoff = Date.now() - WINDOW_DAYS * 86_400_000;

  // First pass: how many orders each town has, so the threshold below is based
  // on real volume rather than a guess.
  const townCounts = new Map<string, number>();
  for (const o of orders) {
    const city = byPhone.get(normalisePhone(o.phone))?.city?.trim();
    if (city) townCounts.set(city.toLowerCase(), (townCounts.get(city.toLowerCase()) ?? 0) + 1);
  }

  const out: ActivityItem[] = [];

  for (const o of orders) {
    if (voided(o.status)) continue;

    const when = parseLagosStamp(o.date);
    if (!when || when.getTime() < cutoff) continue;
    // A clock skew or a typo'd future date would render as "in 3 hours".
    if (when.getTime() > Date.now() + 60_000) continue;

    const customer = byPhone.get(normalisePhone(o.phone));
    const city = customer?.city?.trim() ?? "";
    const state = customer?.state?.trim() ?? "";

    const townIsNameable =
      city && (townCounts.get(city.toLowerCase()) ?? 0) >= MIN_ORDERS_TO_NAME_A_TOWN;

    const place = townIsNameable && state
      ? `${titleCase(city)}, ${titleCase(state)}`
      : state
        ? titleCase(state)
        : townIsNameable
          ? titleCase(city)
          : "";

    // Without a location there is no social proof to give, and "someone
    // somewhere" is noise.
    if (!place) continue;

    for (const line of parseItems(o.items)) {
      const product = matchProduct(line.label, catalogue);
      if (!product?.is_published) continue;

      out.push({
        id: `${o.orderNumber}-${product.sku}`,
        place,
        product: product.name,
        slug: product.slug,
        at: when.toISOString(),
        exactTime: /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}/.test(o.date.trim()),
      });

      // One card per order. A four-item order should not take over the popup.
      break;
    }

    if (out.length >= MAX_ITEMS) break;
  }

  return out;
}
