import { NextResponse } from "next/server";
import { loadSubscribers } from "@/lib/newsletter-store";

/** Escapes a CSV cell, including the leading-character guard against formula injection. */
function cell(value: unknown): string {
  const s = value === null || value === undefined ? "" : String(value);
  const guarded = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return `"${guarded.replace(/"/g, '""')}"`;
}

export async function GET() {
  const { subscribers } = await loadSubscribers();

  const header = ["Email", "Consented at", "Signed up from"];
  const rows = subscribers.map((s) => [s.email, s.consentedAt, s.source]);
  const csv = [header, ...rows].map((r) => r.map(cell).join(",")).join("\r\n");
  const stamp = new Date().toISOString().slice(0, 10);

  // BOM so Excel opens UTF-8 correctly.
  return new NextResponse("\ufeff" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="wendy-herbals-newsletter-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
