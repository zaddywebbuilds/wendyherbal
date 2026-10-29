import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

/** Escapes a CSV cell, including the leading-character guard against formula injection. */
function cell(value: unknown): string {
  const s = value === null || value === undefined ? "" : String(value);
  const guarded = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return `"${guarded.replace(/"/g, '""')}"`;
}

export async function GET() {
  const supabase = getServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "Customer storage is not configured." }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("customers")
    .select("full_name, phone, email, city, state, marketing_consent, total_orders, total_spent, last_order_at, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Customer export failed:", error);
    return NextResponse.json({ error: "Could not export customers." }, { status: 500 });
  }

  const header = [
    "Name", "Phone", "Email", "City", "State",
    "Marketing consent", "Orders", "Total spent (NGN)", "Last order", "Joined",
  ];

  const rows = (data ?? []).map((c) => [
    c.full_name, c.phone, c.email, c.city, c.state,
    c.marketing_consent ? "Yes" : "No",
    c.total_orders, c.total_spent,
    c.last_order_at ? new Date(c.last_order_at).toISOString().slice(0, 10) : "",
    new Date(c.created_at).toISOString().slice(0, 10),
  ]);

  const csv = [header, ...rows].map((r) => r.map(cell).join(",")).join("\r\n");
  const stamp = new Date().toISOString().slice(0, 10);

  return new NextResponse("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="wendy-herbals-customers-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
