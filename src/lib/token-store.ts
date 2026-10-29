import { encrypt, decrypt } from "./crypto";

/**
 * Holds the Google connection (refresh token + the spreadsheet created in the
 * owner's Drive). The refresh token is a long-lived credential, so it is
 * encrypted at rest with ADMIN_SECRET.
 *
 * Two backends:
 *   - Upstash/Vercel KV when KV_REST_API_URL is set. Required on Vercel, whose
 *     filesystem is read-only and per-invocation.
 *   - A gitignored file under .data/ otherwise, which covers local dev and any
 *     ordinary Node host.
 */

export interface GoogleConnection {
  refreshToken: string;
  spreadsheetId: string;
  spreadsheetUrl: string;
  connectedEmail: string;
  connectedAt: string;
}

const KEY = "wendy-herbals:google-connection";
const FILE_DIR = ".data";
const FILE_PATH = `${FILE_DIR}/google-connection.json`;

const useRedis = () =>
  Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

/** True when a connection made now will still be there after a cold start. */
export const storageIsDurable = () =>
  useRedis() || process.env.VERCEL !== "1";

export const storageKind = (): "redis" | "file" | "ephemeral" => {
  if (useRedis()) return "redis";
  return process.env.VERCEL === "1" ? "ephemeral" : "file";
};

/* ---------------------------------------------------------------- redis */

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

/* ----------------------------------------------------------------- file */

async function readFileRaw(): Promise<string | null> {
  const { readFile } = await import("node:fs/promises");
  try {
    return await readFile(FILE_PATH, "utf8");
  } catch {
    return null;
  }
}

async function writeFileRaw(value: string): Promise<void> {
  const { writeFile, mkdir } = await import("node:fs/promises");
  await mkdir(FILE_DIR, { recursive: true });
  await writeFile(FILE_PATH, value, "utf8");
}

async function deleteFileRaw(): Promise<void> {
  const { unlink } = await import("node:fs/promises");
  try {
    await unlink(FILE_PATH);
  } catch {
    /* already gone */
  }
}

/* ------------------------------------------------------------- public API */

export async function saveConnection(conn: GoogleConnection): Promise<void> {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) throw new Error("ADMIN_SECRET is required to store the Google connection.");

  const sealed = await encrypt(JSON.stringify(conn), secret);
  if (useRedis()) {
    await redisCommand(["SET", KEY, sealed]);
  } else {
    await writeFileRaw(sealed);
  }
}

export async function loadConnection(): Promise<GoogleConnection | null> {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return null;

  const sealed = useRedis()
    ? ((await redisCommand(["GET", KEY])) as string | null)
    : await readFileRaw();

  if (!sealed) return null;

  const plain = await decrypt(sealed, secret);
  if (!plain) return null;

  try {
    return JSON.parse(plain) as GoogleConnection;
  } catch {
    return null;
  }
}

export async function clearConnection(): Promise<void> {
  if (useRedis()) {
    await redisCommand(["DEL", KEY]);
  } else {
    await deleteFileRaw();
  }
}
