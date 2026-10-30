import { NextResponse } from "next/server";
import { isSheetsReady, listOrders } from "@/lib/sheets";

/** Escapes a CSV cell, including the leading-character guard against formula injection. */
function cell(value: unknown): string {
  const s = value === null || value === undefined ? "" : String(value);
  const guarded = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return `"${guarded.replace(/"/g, '""')}"`;
}

export async function GET() {
  if (!(await isSheetsReady())) {
    return NextResponse.json({ error: "The order sheet is not connected." }, { status: 503 });
  }

  let orders;
  try {
    orders = await listOrders();
  } catch (err) {
    console.error("Order export failed:", err);
    return NextResponse.json({ error: "Could not read the order sheet." }, { status: 500 });
  }

  const header = [
    "Order #", "Date", "Name", "Phone", "Email",
    "Items", "Total (NGN)", "Deliver to", "Notes", "Status",
  ];

  const rows = orders.map((o) => [
    o.orderNumber, o.date, o.name, o.phone, o.email,
    o.items, o.total, o.deliverTo, o.notes, o.status,
  ]);

  const csv = [header, ...rows].map((r) => r.map(cell).join(",")).join("\r\n");
  const stamp = new Date().toISOString().slice(0, 10);

  // BOM so Excel opens UTF-8 names correctly.
  return new NextResponse("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="wendy-herbals-orders-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
