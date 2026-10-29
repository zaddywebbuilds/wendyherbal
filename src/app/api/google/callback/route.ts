import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { completeConnection } from "@/lib/google-oauth";
import { OAUTH_STATE_COOKIE } from "../connect/route";

const settings = (origin: string, params: Record<string, string>) =>
  NextResponse.redirect(`${origin}/admin/settings?${new URLSearchParams(params)}`);

export async function GET(req: Request) {
  const url = new URL(req.url);
  const origin = url.origin;
  const jar = await cookies();

  const expected = jar.get(OAUTH_STATE_COOKIE)?.value;
  jar.delete(OAUTH_STATE_COOKIE);

  const denied = url.searchParams.get("error");
  if (denied) {
    return settings(origin, {
      error: denied === "access_denied"
        ? "Connection cancelled — nothing was changed."
        : `Google returned: ${denied}`,
    });
  }

  const state = url.searchParams.get("state");
  const code = url.searchParams.get("code");

  if (!expected || !state || state !== expected) {
    return settings(origin, { error: "That sign-in link expired. Please try connecting again." });
  }
  if (!code) {
    return settings(origin, { error: "Google did not return an authorisation code." });
  }

  try {
    const conn = await completeConnection(code, origin);
    return settings(origin, { connected: conn.connectedEmail || "1" });
  } catch (err) {
    console.error("Google connect failed:", err);
    return settings(origin, {
      error: err instanceof Error ? err.message : "Could not complete the connection.",
    });
  }
}
