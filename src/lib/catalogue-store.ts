import type { Product } from "./types";

/**
 * The writable half of the catalogue.
 *
 * Products ship in code (`products.ts`), which is fast and free to serve but
 * cannot be edited from a web page: the hosting filesystem is read-only. This
 * module holds the part the owner can change from the admin screens, as a
 * single small document:
 *
 *   - `patches`  changes to products that ship in code, keyed by SKU
 *   - `created`  products added in admin, which exist only here
 *   - `removed`  SKUs of created products she has deleted
 *
 * A code product is never deleted, only hidden, so an edit can always be
 * undone by clearing the patch.
 *
 * Storage reuses the two backends already proven by the Google connection:
 * Upstash/Vercel KV when configured, a gitignored file under .data/ otherwise.
 * Unlike the Google token this is not a credential, so it is stored as plain
 * JSON and can be read by eye when something looks wrong.
 */

export interface ProductPatch {
  name?: string;
  description?: string;
  category?: string;
  /** null means "price on enquiry". Absent means "leave the coded price". */
  price?: number | null;
  images?: string[];
  in_stock?: boolean;
  stock_count?: number;
  is_published?: boolean;
  ingredients?: string;
  storage_info?: string;
  updatedAt: string;
}

/** A product that exists only in the store. Shape mirrors the coded ones. */
export interface CreatedProduct extends Omit<Product, "created_at"> {
  created_at: string;
}

export interface CatalogueOverlay {
  version: 1;
  patches: Record<string, ProductPatch>;
  created: CreatedProduct[];
  removed: string[];
  updatedAt: string | null;
}

export const EMPTY_OVERLAY: CatalogueOverlay = {
  version: 1,
  patches: {},
  created: [],
  removed: [],
  updatedAt: null,
};

const KEY = "wendy-herbals:catalogue";
const FILE_DIR = ".data";
const FILE_PATH = `${FILE_DIR}/catalogue.json`;

const useRedis = () =>
  Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

/**
 * True when an edit made now survives a restart. False on Vercel without KV,
 * where the filesystem is per-invocation: the admin screens warn rather than
 * letting her type changes that quietly evaporate.
 */
export const catalogueStorageIsDurable = () =>
  useRedis() || process.env.VERCEL !== "1";

export const catalogueStorageKind = (): "redis" | "file" | "ephemeral" => {
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

/* ------------------------------------------------------------- public API */

export async function loadOverlay(): Promise<CatalogueOverlay> {
  let raw: string | null = null;
  try {
    raw = useRedis()
      ? ((await redisCommand(["GET", KEY])) as string | null)
      : await readFileRaw();
  } catch (err) {
    // A storage outage must not take the shop down: fall back to the coded
    // catalogue rather than throwing on a product page.
    console.error("Could not read the catalogue overlay:", err);
    return EMPTY_OVERLAY;
  }

  if (!raw) return EMPTY_OVERLAY;

  try {
    const parsed = JSON.parse(raw) as Partial<CatalogueOverlay>;
    return {
      version: 1,
      patches: parsed.patches ?? {},
      created: parsed.created ?? [],
      removed: parsed.removed ?? [],
      updatedAt: parsed.updatedAt ?? null,
    };
  } catch (err) {
    console.error("Catalogue overlay is not valid JSON, ignoring it:", err);
    return EMPTY_OVERLAY;
  }
}

export async function saveOverlay(overlay: CatalogueOverlay): Promise<void> {
  const next: CatalogueOverlay = { ...overlay, version: 1, updatedAt: new Date().toISOString() };
  const json = JSON.stringify(next);

  if (useRedis()) {
    await redisCommand(["SET", KEY, json]);
  } else {
    await writeFileRaw(json);
  }
}

/** Read, change, write. Callers never juggle the whole document themselves. */
export async function mutateOverlay(
  fn: (overlay: CatalogueOverlay) => CatalogueOverlay
): Promise<CatalogueOverlay> {
  const current = await loadOverlay();
  const next = fn(structuredClone(current));
  await saveOverlay(next);
  return next;
}
