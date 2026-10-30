import { NextResponse } from "next/server";
import { PRODUCTS, CATEGORY_LABELS } from "@/lib/products";

/** Escapes a CSV cell, including the leading-character guard against formula injection. */
function cell(value: unknown): string {
  const s = value === null || value === undefined ? "" : String(value);
  const guarded = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return `"${guarded.replace(/"/g, '""')}"`;
}

const NAFDAC_LABEL: Record<string, string> = {
  approved: "Approved",
  pending: "Pending",
  not_applicable: "Not applicable",
};

/**
 * The catalogue as a spreadsheet, so prices and gaps can be worked through
 * offline and sent back.
 *
 * Price is left empty rather than written as 0 where none is published: a
 * zero in a price column reads as free.
 */
export async function GET() {
  const header = [
    "SKU", "Name", "Collection", "Price (NGN)", "Has photo",
    "Ships with balm", "NAFDAC status", "Stock counted", "Published", "Page",
  ];

  const rows = PRODUCTS.map((p) => [
    p.sku,
    p.name,
    CATEGORY_LABELS[p.category] ?? p.category,
    p.price === null ? "" : p.price,
    p.images.length > 0 ? "Yes" : "No",
    p.includes_balm ? "Yes" : "No",
    NAFDAC_LABEL[p.nafdac_status ?? "pending"] ?? "Pending",
    p.stock_count > 0 ? p.stock_count : "Not counted",
    p.is_published ? "Yes" : "No",
    `/product/${p.slug}`,
  ]);

  const csv = [header, ...rows].map((r) => r.map(cell).join(",")).join("\r\n");
  const stamp = new Date().toISOString().slice(0, 10);

  // BOM so Excel opens UTF-8 names correctly.
  return new NextResponse("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="wendy-herbals-catalogue-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
