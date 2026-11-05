import type { Product } from "./types";
import type { SheetOrderRow } from "./sheets";

/**
 * Reading an order row's free-text Items column back into products.
 *
 * Shared by the dashboard and the storefront activity feed. Both have to agree
 * on what counts as a cancelled order and on how a line maps to a product, or
 * the shop reports one thing and the site shows another.
 */

export const voided = (status: string) => /cancel|refund/i.test(status);

export const isAwaiting = (o: SheetOrderRow) => {
  const s = o.status.toLowerCase();
  return !s || s.includes("await") || s.includes("pending");
};

/** "Ginger Powder x2; Shea Butter (250g) x1" -> two lines. */
export function parseItems(summary: string): { label: string; qty: number }[] {
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
export function matchProduct(label: string, catalogue: Product[]): Product | undefined {
  const lower = label.toLowerCase();
  const exact = catalogue.find((p) => p.name.toLowerCase() === lower);
  if (exact) return exact;

  const withoutSize = lower.replace(/\s*\([^)]*\)\s*$/, "").trim();
  if (withoutSize === lower) return undefined;
  return catalogue.find((p) => p.name.toLowerCase() === withoutSize);
}
