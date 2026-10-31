import { NextResponse } from "next/server";
import { isSheetsReady, listCustomers } from "@/lib/sheets";
import { scopeCustomers, toCsv, toVCard, type Scope } from "@/lib/lead-export";

/**
 * Downloads the buyer list.
 *
 *   ?format=vcf  phone contacts, so they appear in WhatsApp
 *   ?format=csv  spreadsheet (default)
 *   ?scope=opted-in  only buyers who ticked the updates box
 *
 * Gated by the admin middleware, same as the rest of /api/admin.
 */
export async function GET(req: Request) {
  if (!(await isSheetsReady())) {
    return NextResponse.json({ error: "The order sheet is not connected." }, { status: 503 });
  }

  const params = new URL(req.url).searchParams;
  const format = params.get("format") === "vcf" ? "vcf" : "csv";
  const scope: Scope = params.get("scope") === "opted-in" ? "opted-in" : "all";

  let customers;
  try {
    customers = await listCustomers();
  } catch (err) {
    console.error("Lead export failed:", err);
    return NextResponse.json({ error: "Could not read the order sheet." }, { status: 500 });
  }

  const chosen = scopeCustomers(customers, scope);
  const stamp = new Date().toISOString().slice(0, 10);
  const suffix = scope === "opted-in" ? "-opted-in" : "";
  const base = `wendy-herbals-customers${suffix}-${stamp}`;

  if (format === "vcf") {
    const { vcf, included, skipped } = toVCard(chosen);

    if (included === 0) {
      return NextResponse.json(
        { error: "No usable phone numbers in that list, so there is nothing to save." },
        { status: 422 }
      );
    }

    return new NextResponse(vcf, {
      headers: {
        "Content-Type": "text/vcard; charset=utf-8",
        "Content-Disposition": `attachment; filename="${base}.vcf"`,
        "Cache-Control": "no-store",
        // Surfaced so the page can say how many were left out rather than
        // letting her think the file is complete when it is not.
        "X-Contacts-Included": String(included),
        "X-Contacts-Skipped": String(skipped.length),
      },
    });
  }

  return new NextResponse(toCsv(chosen), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${base}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
