import { NextResponse } from "next/server";
import { clearConnection } from "@/lib/token-store";
import { resetAccessTokenCache } from "@/lib/google-oauth";

export async function POST(req: Request) {
  await clearConnection();
  resetAccessTokenCache();

  // The spreadsheet is hers and is deliberately left untouched in her Drive.
  return NextResponse.redirect(
    `${new URL(req.url).origin}/admin/settings?disconnected=1`,
    { status: 303 }
  );
}
