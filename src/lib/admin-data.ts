import { PRODUCTS, getLowStock, CATEGORY_LABELS } from "./products";
import type { Order, DashboardStats } from "./types";

/**
 * Admin figures are derived from real records only. The store has taken no
 * orders yet, so totals are genuinely zero and the dashboard renders empty
 * states rather than illustrative numbers.
 */

export const ORDERS: Order[] = [];

export function getDashboardStats(): DashboardStats {
  const paid = ORDERS.filter((o) => o.payment_status === "paid");
  const customers = new Set(ORDERS.map((o) => o.customer_email));

  return {
    total_sales: paid.reduce((sum, o) => sum + o.total, 0),
    total_orders: ORDERS.length,
    total_customers: customers.size,
    products_in_stock: PRODUCTS.filter((p) => p.in_stock).length,
    low_stock_count: getLowStock().length,
    sales_vs_last_month: 0,
    orders_vs_last_month: 0,
    customers_vs_last_month: 0,
  };
}

export function getOrderStatusCounts() {
  const counts: Record<string, number> = {
    pending: 0, confirmed: 0, processing: 0, dispatched: 0, delivered: 0, cancelled: 0,
  };
  for (const o of ORDERS) {
    if (o.status in counts) counts[o.status] += 1;
  }
  return counts;
}

export function getTopSelling(limit = 5) {
  const tally = new Map<string, { name: string; units: number; revenue: number }>();
  for (const o of ORDERS) {
    if (o.payment_status !== "paid") continue;
    for (const item of o.items) {
      const row = tally.get(item.product_id) ?? { name: item.product_name, units: 0, revenue: 0 };
      row.units += item.quantity;
      row.revenue += item.unit_price * item.quantity;
      tally.set(item.product_id, row);
    }
  }
  return [...tally.entries()]
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

export function getRecentOrders(limit = 5) {
  return [...ORDERS]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, limit);
}

export function getSalesByCategory() {
  const totals: Record<string, number> = {};
  for (const key of Object.keys(CATEGORY_LABELS)) totals[key] = 0;

  for (const o of ORDERS) {
    if (o.payment_status !== "paid") continue;
    for (const item of o.items) {
      const product = PRODUCTS.find((p) => p.id === item.product_id);
      if (product) totals[product.category] = (totals[product.category] ?? 0) + item.unit_price * item.quantity;
    }
  }
  return Object.entries(totals).map(([key, value]) => ({
    key, label: CATEGORY_LABELS[key] ?? key, value,
  }));
}

/** Daily paid revenue across a month, for the sales trend chart. */
export function getSalesSeries(year: number, month: number) {
  const days = new Date(year, month + 1, 0).getDate();
  const series = Array.from({ length: days }, (_, i) => ({ day: i + 1, value: 0 }));

  for (const o of ORDERS) {
    if (o.payment_status !== "paid") continue;
    const d = new Date(o.created_at);
    if (d.getFullYear() === year && d.getMonth() === month) {
      series[d.getDate() - 1].value += o.total;
    }
  }
  return series;
}

export const getLowStockProducts = (limit = 5) =>
  getLowStock().sort((a, b) => a.stock_count - b.stock_count).slice(0, limit);
