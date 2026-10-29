import { sign, verify, timingSafeEqual } from "./crypto";

export const ADMIN_COOKIE = "wh_admin";
const SESSION_HOURS = 12;

export const isAdminAuthConfigured = () =>
  Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_SECRET);

/** Checks the submitted password without leaking its prefix through timing. */
export async function checkPassword(submitted: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return timingSafeEqual(submitted, expected);
}

export async function createSession(): Promise<string> {
  const expiresAt = Date.now() + SESSION_HOURS * 3_600_000;
  return sign(JSON.stringify({ exp: expiresAt }), process.env.ADMIN_SECRET!);
}

export async function isValidSession(cookieValue: string | undefined): Promise<boolean> {
  if (!cookieValue || !process.env.ADMIN_SECRET) return false;
  const payload = await verify(cookieValue, process.env.ADMIN_SECRET);
  if (!payload) return false;
  try {
    const { exp } = JSON.parse(payload) as { exp: number };
    return typeof exp === "number" && Date.now() < exp;
  } catch {
    return false;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_HOURS * 3600,
};
