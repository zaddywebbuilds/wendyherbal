import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ADMIN_COOKIE, checkEnvPassword, createSession, isAdminAuthConfigured, sessionCookieOptions,
} from "@/lib/admin-auth";
import { loadStoredPassword, verifyStoredPassword } from "@/lib/admin-password";

// Crude in-memory throttle. Enough to stop casual guessing on a single-shop
// deployment; a distributed store would be needed across many instances.
const attempts = new Map<string, { count: number; until: number }>();
const MAX_ATTEMPTS = 6;
const LOCKOUT_MS = 10 * 60_000;

/**
 * Two passwords can open the door.
 *
 * Her own, once she has set one, signs her straight in. The handover password
 * from the environment also works — it is the only way back in on a
 * deployment with no email — but it always lands on the change-password
 * screen, so the password we wrote down at setup is never the one the shop
 * runs on.
 *
 * Both branches are evaluated the same way from the outside: a wrong password
 * costs the same work whichever one it was meant to be.
 */
async function authenticate(submitted: string): Promise<{ ok: boolean; mustChange: boolean }> {
  const stored = await loadStoredPassword();

  const [envOk, ownOk] = await Promise.all([
    checkEnvPassword(submitted),
    stored ? verifyStoredPassword(submitted, stored) : Promise.resolve(false),
  ]);

  if (ownOk) return { ok: true, mustChange: false };
  if (envOk) return { ok: true, mustChange: true };
  return { ok: false, mustChange: false };
}

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

  const { ok, mustChange } = password
    ? await authenticate(password)
    : { ok: false, mustChange: false };

  if (!ok) {
    const next = record && Date.now() < record.until
      ? { count: record.count + 1, until: record.until }
      : { count: 1, until: Date.now() + LOCKOUT_MS };
    attempts.set(ip, next);
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  attempts.delete(ip);
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, await createSession(mustChange), sessionCookieOptions);

  // The form sends her to /admin/password itself rather than following its
  // usual redirect, so the first thing she sees is why, not a bounce.
  return NextResponse.json({ ok: true, mustChange });
}

export async function DELETE() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
  return NextResponse.json({ ok: true });
}
