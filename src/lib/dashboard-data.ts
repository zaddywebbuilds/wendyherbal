import { isSheetsReady, listOrders, listCustomers, type SheetOrderRow, type SheetCustomer } from "./sheets";
import { getCatalogueFresh } from "./catalogue";
import { CATEGORY_LABELS } from "./products";
import type { Product } from "./types";

/**
 * Everything the dashboard shows, derived from the order sheet and the
 * catalogue. Nothing here is illustrative: a figure that cannot be worked out
 * from real records is not returned, and the screen renders an empty state
 * instead.
 */

export interface TopSeller {
  name: string;
  units: number;
  revenue: number;
  product?: Product;
}

export interface DashboardData {
  configured: boolean;
  error: string | null;

  orders: SheetOrderRow[];
  customers: SheetCustomer[];
  recent: SheetOrderRow[];

  orderCount: number;
  customerCount: number;
  /** Order value excluding anything marked cancelled or refunded. */
  recordedValue: number;
  awaiting: number;

  ordersThisMonth: number;
  ordersLastMonth: number;
  valueThisMonth: number;
  valueLastMonth: number;

  statusCounts: { label: string; count: number; color: string }[];
  topSelling: TopSeller[];
  byCategory: { key: string; label: string; value: number }[];
  series: { day: number; value: number }[];

  /**
   * False when no order's item column could be read. The top sellers and
   * category split are hidden rather than shown as zero, because zero would
   * read as "nothing sold" rather than "cannot be worked out".
   */
  itemsReadable: boolean;

  productsInStock: number;
  lowStock: Product[];
}

const voided = (status: string) => /cancel|refund/i.test(status);

const isAwaiting = (o: SheetOrderRow) => {
  const s = o.status.toLowerCase();
  return !s || s.includes("await") || s.includes("pending");
};

const STATUS_BUCKETS: { label: string; color: string; test: (s: string) => boolean }[] = [
  { label: "Awaiting payment", color: "#F59E0B", test: (s) => !s || /await|pending/.test(s) },
  { label: "Confirmed", color: "#3B82F6", test: (s) => /paid|confirm/.test(s) },
  { label: "Processing", color: "#8B5CF6", test: (s) => /pack|process/.test(s) },
  { label: "Dispatched", color: "#6366F1", test: (s) => /dispatch|ship|sent/.test(s) },
  { label: "Delivered", color: "#123D2B", test: (s) => /deliver|complete/.test(s) },
  { label: "Cancelled or refunded", color: "#EF4444", test: (s) => /cancel|refund/.test(s) },
];

/**
 * "Ginger Powder x2; Sperm Booster Herbs (500ml) x1" as written by /api/orders.
 *
 * The label is kept whole, parentheses and all. Several real product names
 * contain them, for example "Brain Booster Herbs (Big)" and "Banga Spices
 * (Ofe Akwu)", so stripping a trailing bracket to drop the size would merge
 * the two Brain Booster pack sizes into one row and match neither against the
 * catalogue. The size is removed only as a fallback when matching.
 */
function parseItems(summary: string): { label: string; qty: number }[] {
  if (!summary.trim()) return [];
  const out: { label: string; qty: number }[] = [];

  for (const chunk of summary.split(";")) {
    const m = chunk.trim().match(/^(.+?)\s*x\s*(\d+)$/i);
    if (!m) continue;
    const qty = Number(m[2]);
    if (!Number.isFinite(qty) || qty < 1) continue;
    out.push({ label: m[1].trim(), qty });
  }
  return out;
}

/** Exact name first; only then try it without a trailing size in brackets. */
function matchProduct(label: string, catalogue: Product[]): Product | undefined {
  const lower = label.toLowerCase();
  const exact = catalogue.find((p) => p.name.toLowerCase() === lower);
  if (exact) return exact;

  const withoutSize = lower.replace(/\s*\([^)]*\)\s*$/, "").trim();
  if (withoutSize === lower) return undefined;
  return catalogue.find((p) => p.name.toLowerCase() === withoutSize);
}

/** YYYY-MM-DD as written by the sheet writer; anything else is skipped. */
function monthOf(date: string): string | null {
  const m = date.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[1]}-${m[2]}` : null;
}

function dayOf(date: string): number | null {
  const m = date.trim().match(/^\d{4}-\d{2}-(\d{2})/);
  return m ? Number(m[1]) : null;
}

export async function getDashboardData(now = new Date()): Promise<DashboardData> {
  const catalogue = await getCatalogueFresh();
  const published = catalogue.filter((p) => p.is_published);

  const base = {
    orders: [] as SheetOrderRow[],
    customers: [] as SheetCustomer[],
    recent: [] as SheetOrderRow[],
    orderCount: 0,
    customerCount: 0,
    recordedValue: 0,
    awaiting: 0,
    ordersThisMonth: 0,
    ordersLastMonth: 0,
    valueThisMonth: 0,
    valueLastMonth: 0,
    statusCounts: [] as DashboardData["statusCounts"],
    topSelling: [] as TopSeller[],
    byCategory: [] as DashboardData["byCategory"],
    series: [] as DashboardData["series"],
    itemsReadable: false,
    productsInStock: published.filter((p) => p.in_stock).length,
    // stock_count 0 means "not counted yet", so it is never a low-stock alert.
    lowStock: published
      .filter((p) => p.stock_count > 0 && p.stock_count <= 8)
      .sort((a, b) => a.stock_count - b.stock_count)
      .slice(0, 5),
  };

  if (!(await isSheetsReady())) {
    return { ...base, configured: false, error: null };
  }

  let orders: SheetOrderRow[];
  let customers: SheetCustomer[];
  try {
    [orders, customers] = await Promise.all([listOrders(), listCustomers()]);
  } catch (err) {
    console.error("Dashboard could not read the order sheet:", err);
    return { ...base, configured: true, error: "Could not read the order sheet. Try reconnecting from Settings." };
  }

  const live = orders.filter((o) => !voided(o.status));
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonth = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}`;

  const series = Array.from(
    { length: new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() },
    (_, i) => ({ day: i + 1, value: 0 })
  );

  let ordersThisMonth = 0, ordersLastMonth = 0, valueThisMonth = 0, valueLastMonth = 0;
  for (const o of live) {
    const month = monthOf(o.date);
    if (month === thisMonth) {
      ordersThisMonth += 1;
      valueThisMonth += o.total;
      const day = dayOf(o.date);
      if (day && series[day - 1]) series[day - 1].value += o.total;
    } else if (month === lastMonth) {
      ordersLastMonth += 1;
      valueLastMonth += o.total;
    }
  }

  // Line items, matched back to the catalogue by name so a price and category
  // can be attached. Anything that does not match is left out rather than
  // guessed at.
  const tally = new Map<string, TopSeller>();
  const categoryTotals = new Map<string, number>();
  let itemsReadable = false;

  for (const o of live) {
    for (const item of parseItems(o.items)) {
      itemsReadable = true;
      const product = matchProduct(item.label, catalogue);
      const key = product?.sku ?? item.label.toLowerCase();
      const row = tally.get(key) ?? { name: product?.name ?? item.label, units: 0, revenue: 0, product };
      row.units += item.qty;
      if (product?.price) {
        row.revenue += product.price * item.qty;
        categoryTotals.set(product.category, (categoryTotals.get(product.category) ?? 0) + product.price * item.qty);
      }
      tally.set(key, row);
    }
  }

  const statusCounts = STATUS_BUCKETS
    .map((b) => ({
      label: b.label,
      color: b.color,
      count: orders.filter((o) => b.test(o.status.toLowerCase())).length,
    }))
    .filter((b) => b.count > 0);

  return {
    configured: true,
    error: null,
    orders,
    customers,
    recent: orders.slice(0, 5),
    orderCount: orders.length,
    customerCount: customers.length,
    recordedValue: live.reduce((sum, o) => sum + o.total, 0),
    awaiting: orders.filter(isAwaiting).length,
    ordersThisMonth,
    ordersLastMonth,
    valueThisMonth,
    valueLastMonth,
    statusCounts,
    topSelling: [...tally.values()].sort((a, b) => b.units - a.units).slice(0, 5),
    byCategory: Object.keys(CATEGORY_LABELS).map((key) => ({
      key,
      label: CATEGORY_LABELS[key],
      value: categoryTotals.get(key) ?? 0,
    })),
    series,
    itemsReadable,
    productsInStock: base.productsInStock,
    lowStock: base.lowStock,
  };
}

/** Percentage change, or null when last month has nothing to compare against. */
export function percentChange(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}
