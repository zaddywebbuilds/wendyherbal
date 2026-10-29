import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ADMIN_COOKIE, checkPassword, createSession, isAdminAuthConfigured, sessionCookieOptions,
} from "@/lib/admin-auth";

// Crude in-memory throttle. Enough to stop casual guessing on a single-shop
// deployment; a distributed store would be needed across many instances.
const attempts = new Map<string, { count: number; until: number }>();
const MAX_ATTEMPTS = 6;
const LOCKOUT_MS = 10 * 60_000;

export async function POST(req: Request) {
  if (!isAdminAuthConfigured()) {
    return NextResponse.json(
      { error: "Set ADMIN_PASSWORD and ADMIN_SECRET before signing in." },
      { status: 503 }
    );
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const record = attempts.get(ip);
  if (record && record.count >= MAX_ATTEMPTS && Date.now() < record.until) {
    const mins = Math.ceil((record.until - Date.now()) / 60_000);
    return NextResponse.json(
      { error: `Too many attempts. Try again in ${mins} minute${mins === 1 ? "" : "s"}.` },
      { status: 429 }
    );
  }

  let password = "";
  try {
    ({ password } = (await req.json()) as { password?: string } as { password: string });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!password || !(await checkPassword(password))) {
    const next = record && Date.now() < record.until
      ? { count: record.count + 1, until: record.until }
      : { count: 1, until: Date.now() + LOCKOUT_MS };
    attempts.set(ip, next);
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  attempts.delete(ip);
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, await createSession(), sessionCookieOptions);

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
  return NextResponse.json({ ok: true });
}
