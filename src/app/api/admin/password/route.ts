import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ADMIN_COOKIE, checkEnvPassword, createSession, sessionCookieOptions,
} from "@/lib/admin-auth";
import {
  loadStoredPassword, setStoredPassword, verifyStoredPassword, passwordStorageIsDurable,
} from "@/lib/admin-password";

/** Short enough for a real person to type on a phone, long enough to be worth having. */
const MIN_LENGTH = 10;

export async function POST(req: Request) {
  // The middleware has already established that there is a valid session, so
  // this endpoint only has to care about the passwords themselves.

  if (!passwordStorageIsDurable()) {
    return NextResponse.json(
      {
        error:
          "A new password cannot be saved yet: this deployment has no storage attached. " +
          "Add a KV store in Vercel first, or the change would be lost and you would be " +
          "locked out of a password you think you changed.",
      },
      { status: 503 }
    );
  }

  let current = "";
  let next = "";
  try {
    ({ current, next } = (await req.json()) as { current: string; next: string });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (typeof next !== "string" || next.trim().length < MIN_LENGTH) {
    return NextResponse.json(
      { error: `Use at least ${MIN_LENGTH} characters.` },
      { status: 400 }
    );
  }

  // Re-checking the current password matters even though she is already signed
  // in: it stops someone who finds an unattended phone from taking the account.
  const stored = await loadStoredPassword();
  const [envOk, ownOk] = await Promise.all([
    checkEnvPassword(current ?? ""),
    stored ? verifyStoredPassword(current ?? "", stored) : Promise.resolve(false),
  ]);
  if (!envOk && !ownOk) {
    return NextResponse.json({ error: "That is not your current password." }, { status: 401 });
  }

  if (await checkEnvPassword(next)) {
    return NextResponse.json(
      { error: "Choose a different password from the one you were given." },
      { status: 400 }
    );
  }

  try {
    await setStoredPassword(next.trim());
  } catch (err) {
    console.error("Could not save the new admin password:", err);
    return NextResponse.json(
      { error: "Could not save the new password. Please try again." },
      { status: 500 }
    );
  }

  // Fresh cookie without the flag, so the forced-change redirect stops.
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, await createSession(false), sessionCookieOptions);

  return NextResponse.json({ ok: true });
}
