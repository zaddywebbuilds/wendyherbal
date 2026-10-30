import { NextResponse } from "next/server";
import { loadConnection, saveConnection } from "@/lib/token-store";
import {
  getConnectedAccessToken, createSpreadsheet, linkExistingSpreadsheet,
} from "@/lib/google-oauth";

/**
 * Chooses the single sheet every order is written to — either a new one this
 * app creates, or one she already keeps and picked herself.
 */
export async function POST(req: Request) {
  const conn = await loadConnection();
  if (!conn) {
    return NextResponse.json({ error: "Connect a Google account first." }, { status: 409 });
  }

  const token = await getConnectedAccessToken();
  if (!token) {
    return NextResponse.json(
      { error: "That Google connection has expired. Please connect again." },
      { status: 409 }
    );
  }

  let mode: string, spreadsheetId: string | undefined;
  try {
    ({ mode, spreadsheetId } = (await req.json()) as { mode: string; spreadsheetId?: string });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    let sheet: { id: string; url: string; name: string };

    if (mode === "create") {
      sheet = await createSpreadsheet(token);
    } else if (mode === "link") {
      // Google file IDs are URL-safe base64-ish; reject anything else outright.
      if (!spreadsheetId || !/^[A-Za-z0-9_-]{20,100}$/.test(spreadsheetId)) {
        return NextResponse.json({ error: "That does not look like a valid sheet." }, { status: 400 });
      }
      sheet = await linkExistingSpreadsheet(token, spreadsheetId);
    } else {
      return NextResponse.json({ error: "Unknown mode." }, { status: 400 });
    }

    await saveConnection({
      ...conn,
      spreadsheetId: sheet.id,
      spreadsheetUrl: sheet.url,
      spreadsheetName: sheet.name,
      spreadsheetOrigin: mode === "create" ? "created" : "picked",
    });

    return NextResponse.json({ ok: true, ...sheet });
  } catch (err) {
    console.error("Linking the sheet failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not link that sheet." },
      { status: 500 }
    );
  }
}

/** Short-lived token for the Google Picker, which runs in the browser. */
export async function GET() {
  const conn = await loadConnection();
  if (!conn) {
    return NextResponse.json({ error: "Connect a Google account first." }, { status: 409 });
  }

  const token = await getConnectedAccessToken();
  if (!token) {
    return NextResponse.json({ error: "That connection has expired." }, { status: 409 });
  }

  return NextResponse.json(
    { accessToken: token, apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY ?? null },
    { headers: { "Cache-Control": "no-store" } }
  );
}
