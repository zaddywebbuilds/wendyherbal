import { sign, verify, timingSafeEqual } from "./crypto";

export const ADMIN_COOKIE = "wh_admin";
const SESSION_HOURS = 12;

/**
 * Session payload.
 *
 * `mustChange` is set when the sign-in used the handover password from the
 * environment rather than the owner's own. The middleware reads it straight
 * out of the verified cookie, so forcing the change costs no extra I/O.
 */
export interface Session {
  exp: number;
  mustChange?: boolean;
}

export const isAdminAuthConfigured = () =>
  Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_SECRET);

/**
 * Whether a new password could actually be saved.
 *
 * Reads environment variables only — no I/O — so the middleware can call it on
 * the Edge. `admin-password.ts` re-exports it rather than defining its own, so
 * the gate and the writer can never disagree about what durable means.
 *
 * This decides whether the change is *forced*, not just whether it can be
 * saved. On Vercel with no KV store attached the change cannot be written, so
 * forcing it would redirect every admin route to a screen that refuses — the
 * owner would be locked out of the dashboard completely, by a safety feature.
 * Better to let her in and leave the password as it is.
 */
export const passwordStorageIsDurable = () =>
  Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) ||
  process.env.VERCEL !== "1";

/**
 * Checks the submitted password against the handover one in the environment.
 *
 * The owner's own password lives in `admin-password.ts` and is checked by the
 * login route. This file stays free of that import on purpose: the middleware
 * imports this module and runs on the Edge, where the store's file fallback
 * cannot be bundled.
 */
export async function checkEnvPassword(submitted: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return timingSafeEqual(submitted, expected);
}

export async function createSession(mustChange = false): Promise<string> {
  const expiresAt = Date.now() + SESSION_HOURS * 3_600_000;
  const payload: Session = mustChange ? { exp: expiresAt, mustChange: true } : { exp: expiresAt };
  return sign(JSON.stringify(payload), process.env.ADMIN_SECRET!);
}

/** The verified payload, or null if the cookie is absent, forged or expired. */
export async function readSession(cookieValue: string | undefined): Promise<Session | null> {
  if (!cookieValue || !process.env.ADMIN_SECRET) return null;
  const payload = await verify(cookieValue, process.env.ADMIN_SECRET);
  if (!payload) return null;
  try {
    const session = JSON.parse(payload) as Session;
    if (typeof session.exp !== "number" || Date.now() >= session.exp) return null;
    return session;
  } catch {
    return null;
  }
}

export async function isValidSession(cookieValue: string | undefined): Promise<boolean> {
  return (await readSession(cookieValue)) !== null;
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_HOURS * 3600,
};
