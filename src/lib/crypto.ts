/**
 * AES-256-GCM for the stored Google refresh token, and HMAC for the admin
 * session cookie.
 *
 * Uses Web Crypto rather than node:crypto so the same helpers run in both the
 * Node runtime (route handlers) and the Edge runtime (middleware).
 */

const enc = new TextEncoder();
const dec = new TextDecoder();

export const b64url = (bytes: ArrayBuffer | Uint8Array) =>
  Buffer.from(bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes))
    .toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

export const fromB64url = (s: string) =>
  new Uint8Array(Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64"));

/** Stretches any secret into a 32-byte key. */
async function deriveKey(secret: string, usage: KeyUsage[], algo: "AES-GCM" | "HMAC") {
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(secret));
  return crypto.subtle.importKey(
    "raw",
    digest,
    algo === "HMAC" ? { name: "HMAC", hash: "SHA-256" } : { name: "AES-GCM" },
    false,
    usage
  );
}

/* ----------------------------------------------------------- encryption */

export async function encrypt(plaintext: string, secret: string): Promise<string> {
  const key = await deriveKey(secret, ["encrypt"], "AES-GCM");
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(plaintext));
  return `${b64url(iv)}.${b64url(ct)}`;
}

export async function decrypt(payload: string, secret: string): Promise<string | null> {
  try {
    const [ivPart, ctPart] = payload.split(".");
    if (!ivPart || !ctPart) return null;
    const key = await deriveKey(secret, ["decrypt"], "AES-GCM");
    const pt = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: fromB64url(ivPart) },
      key,
      fromB64url(ctPart)
    );
    return dec.decode(pt);
  } catch {
    return null;
  }
}

/* ---------------------------------------------------------------- HMAC */

export async function sign(payload: string, secret: string): Promise<string> {
  const key = await deriveKey(secret, ["sign"], "HMAC");
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return `${b64url(enc.encode(payload))}.${b64url(sig)}`;
}

export async function verify(token: string, secret: string): Promise<string | null> {
  try {
    const [payloadPart, sigPart] = token.split(".");
    if (!payloadPart || !sigPart) return null;
    const payload = dec.decode(fromB64url(payloadPart));
    const key = await deriveKey(secret, ["verify"], "HMAC");
    const ok = await crypto.subtle.verify("HMAC", key, fromB64url(sigPart), enc.encode(payload));
    return ok ? payload : null;
  } catch {
    return null;
  }
}

/** Length-safe comparison, so a wrong password does not leak its prefix. */
export async function timingSafeEqual(a: string, b: string): Promise<boolean> {
  const [ha, hb] = await Promise.all([
    crypto.subtle.digest("SHA-256", enc.encode(a)),
    crypto.subtle.digest("SHA-256", enc.encode(b)),
  ]);
  const x = new Uint8Array(ha);
  const y = new Uint8Array(hb);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}
