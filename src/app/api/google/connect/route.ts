import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isOAuthConfigured, buildConsentUrl } from "@/lib/google-oauth";
import { b64url } from "@/lib/crypto";

export const OAUTH_STATE_COOKIE = "wh_oauth_state";

export async function GET(req: Request) {
  if (!isOAuthConfigured()) {
    return NextResponse.json(
      { error: "GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are not set." },
      { status: 503 }
    );
  }

  // Single-use state, echoed back by Google, so a forged callback cannot
  // connect an attacker's account.
  const state = b64url(crypto.getRandomValues(new Uint8Array(24)));
  const origin = new URL(req.url).origin;

  const jar = await cookies();
  jar.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });

  return NextResponse.redirect(buildConsentUrl(origin, state));
}
