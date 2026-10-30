import { CATEGORY_LABELS } from "./products";

/**
 * Validation shared by the create and edit endpoints.
 *
 * Everything the admin screens send is checked here rather than trusted,
 * because these routes sit behind a password rather than a full account
 * system, and a malformed price would reach the shop front immediately.
 */

export interface ProductInput {
  name?: string;
  description?: string;
  category?: string;
  price?: number | null;
  images?: string[];
  in_stock?: boolean;
  stock_count?: number;
  is_published?: boolean;
  ingredients?: string;
  storage_info?: string;
}

export type Parsed = { ok: true; value: ProductInput } | { ok: false; error: string };

const str = (v: unknown, max: number) =>
  typeof v === "string" ? v.trim().slice(0, max) : undefined;

export const slugify = (s: string) =>
  s.toLowerCase().replace(/[()&]/g, " ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/**
 * Image paths must stay inside the site's own media folders. A remote URL
 * would need the host allow-listed in next.config and would let an attacker
 * point the shop at anything, so it is refused with an explanation.
 */
function parseImages(raw: unknown): string[] | undefined | { error: string } {
  if (raw === undefined) return undefined;
  if (!Array.isArray(raw)) return { error: "Images must be a list." };

  const out: string[] = [];
  for (const item of raw.slice(0, 8)) {
    const s = typeof item === "string" ? item.trim() : "";
    if (!s) continue;
    if (!s.startsWith("/media/")) {
      return { error: `Image paths must start with /media/. Received "${s.slice(0, 40)}".` };
    }
    if (s.includes("..")) return { error: "Image paths cannot contain '..'." };
    out.push(s);
  }
  return out;
}

export function parseProductInput(body: unknown, { requireName }: { requireName: boolean }): Parsed {
  if (!body || typeof body !== "object") return { ok: false, error: "Invalid request." };
  const b = body as Record<string, unknown>;
  const value: ProductInput = {};

  const name = str(b.name, 140);
  if (requireName && !name) return { ok: false, error: "A product name is required." };
  if (name !== undefined) value.name = name;

  const description = str(b.description, 2000);
  if (description !== undefined) value.description = description;

  if (b.category !== undefined) {
    const category = str(b.category, 60) ?? "";
    if (!(category in CATEGORY_LABELS)) {
      return { ok: false, error: "Choose one of the existing collections." };
    }
    value.category = category;
  } else if (requireName) {
    return { ok: false, error: "Choose a collection for this product." };
  }

  if (b.price !== undefined) {
    if (b.price === null || b.price === "") {
      value.price = null;
    } else {
      const n = Number(b.price);
      if (!Number.isFinite(n) || n < 0 || n > 100_000_000) {
        return { ok: false, error: "Price must be a number, or left empty for price on enquiry." };
      }
      value.price = Math.round(n);
    }
  }

  const images = parseImages(b.images);
  if (images && !Array.isArray(images)) return { ok: false, error: images.error };
  if (images !== undefined) value.images = images as string[];

  if (b.in_stock !== undefined) value.in_stock = Boolean(b.in_stock);
  if (b.is_published !== undefined) value.is_published = Boolean(b.is_published);

  if (b.stock_count !== undefined) {
    const n = Number(b.stock_count);
    if (!Number.isInteger(n) || n < 0 || n > 1_000_000) {
      return { ok: false, error: "Stock count must be a whole number, or 0 if you have not counted." };
    }
    value.stock_count = n;
  }

  const ingredients = str(b.ingredients, 2000);
  if (ingredients !== undefined) value.ingredients = ingredients;

  const storage = str(b.storage_info, 1000);
  if (storage !== undefined) value.storage_info = storage;

  return { ok: true, value };
}
