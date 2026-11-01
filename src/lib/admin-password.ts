/**
 * The owner's own admin password.
 *
 * `ADMIN_PASSWORD` in the environment is the password we hand over at setup.
 * It keeps working as a recovery key — there is no email on this deployment,
 * so if she forgets her own password the only way back in is the one held in
 * Vercel. Signing in with it always forces a change, so the handover password
 * is never what the shop runs on day to day.
 *
 * Her own password is stored here, hashed with PBKDF2-HMAC-SHA256 and a random
 * salt. The iteration count is stored alongside so it can be raised later
 * without locking anyone out: an old record keeps verifying at its own count.
 *
 * Imported only from Node route handlers. The middleware must not pull this
 * in — it runs on the Edge, and the file fallback needs node:fs.
 */

const KEY = "wendy-herbals:admin-password";
const FILE_DIR = ".data";
const FILE_PATH = `${FILE_DIR}/admin-password.json`;

/** OWASP's floor for PBKDF2-HMAC-SHA256. Only runs on sign-in, so the cost is paid once. */
const ITERATIONS = 310_000;

export interface StoredPassword {
  version: 1;
  salt: string;
  iterations: number;
  hash: string;
  updatedAt: string;
}

const enc = new TextEncoder();

const toB64 = (bytes: Uint8Array) => Buffer.from(bytes).toString("base64");
const fromB64 = (s: string) => new Uint8Array(Buffer.from(s, "base64"));

const useRedis = () =>
  Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

/**
 * Whether a new password can actually be saved.
 *
 * Defined in `admin-auth.ts` because the middleware needs it on the Edge and
 * cannot import this module. Re-exported here so callers have one name for it
 * and the gate can never disagree with the writer.
 */
export { passwordStorageIsDurable } from "./admin-auth";

async function redisCommand(args: (string | number)[]): Promise<unknown> {
  const res = await fetch(process.env.KV_REST_API_URL!, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`KV command failed (${res.status}): ${await res.text()}`);
  const data = (await res.json()) as { result?: unknown };
  return data.result ?? null;
}

async function derive(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const material = await crypto.subtle.importKey(
    "raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt as BufferSource, iterations, hash: "SHA-256" },
    material,
    256
  );
  return new Uint8Array(bits);
}

export async function loadStoredPassword(): Promise<StoredPassword | null> {
  let raw: string | null = null;
  try {
    if (useRedis()) {
      raw = (await redisCommand(["GET", KEY])) as string | null;
    } else {
      const { readFile } = await import("node:fs/promises");
      raw = await readFile(FILE_PATH, "utf8").catch(() => null);
    }
  } catch (err) {
    console.error("Could not read the stored admin password:", err);
    return null;
  }
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as StoredPassword;
    if (!parsed.salt || !parsed.hash || !parsed.iterations) return null;
    return parsed;
  } catch {
    console.error("Stored admin password is not valid JSON, ignoring it.");
    return null;
  }
}

export async function setStoredPassword(password: string): Promise<void> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derive(password, salt, ITERATIONS);

  const record: StoredPassword = {
    version: 1,
    salt: toB64(salt),
    iterations: ITERATIONS,
    hash: toB64(hash),
    updatedAt: new Date().toISOString(),
  };

  const json = JSON.stringify(record);
  if (useRedis()) {
    await redisCommand(["SET", KEY, json]);
  } else {
    const { writeFile, mkdir } = await import("node:fs/promises");
    await mkdir(FILE_DIR, { recursive: true });
    await writeFile(FILE_PATH, json, "utf8");
  }
}

/** Constant-time over the digest, so a wrong password does not leak its prefix. */
export async function verifyStoredPassword(
  submitted: string,
  record: StoredPassword
): Promise<boolean> {
  let expected: Uint8Array;
  try {
    expected = fromB64(record.hash);
  } catch {
    return false;
  }

  const actual = await derive(submitted, fromB64(record.salt), record.iterations);
  if (actual.length !== expected.length) return false;

  let diff = 0;
  for (let i = 0; i < actual.length; i++) diff |= actual[i] ^ expected[i];
  return diff === 0;
}
