import { NextResponse } from "next/server";
import { isSheetsReady, listCustomers } from "@/lib/sheets";

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

  let customers;
  try {
    customers = await listCustomers();
  } catch (err) {
    console.error("Customer export failed:", err);
    return NextResponse.json({ error: "Could not read the order sheet." }, { status: 500 });
  }

  const header = [
    "Name", "Phone", "Email", "City", "State",
    "Marketing consent", "Orders", "Total spent (NGN)", "First order", "Last order",
  ];

  const rows = customers.map((c) => [
    c.name, c.phone, c.email, c.city, c.state,
    c.consent ? "Yes" : "No", c.orders, c.spent, c.firstOrder, c.lastOrder,
  ]);

  const csv = [header, ...rows].map((r) => r.map(cell).join(",")).join("\r\n");
  const stamp = new Date().toISOString().slice(0, 10);

  // BOM so Excel opens UTF-8 names correctly.
  return new NextResponse("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="wendy-herbals-customers-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
