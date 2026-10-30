/**
 * Where an uploaded product photograph goes.
 *
 * Two backends, matching the pattern already used for the Google token and
 * the catalogue:
 *   - Vercel Blob when BLOB_READ_WRITE_TOKEN is set. Required on Vercel,
 *     whose filesystem is read-only.
 *   - public/media/uploads/ otherwise, which covers local development.
 *
 * The Blob REST API is called directly rather than through @vercel/blob. This
 * is one PUT, and the project already prefers a few fetch calls over a large
 * dependency; see the note about googleapis in HANDOFF.md.
 */

const BLOB_API = "https://blob.vercel-storage.com";

/** Browser-safe formats this shop will serve. */
export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

/** Phone photographs are routinely 3 to 6MB; 10 leaves headroom. */
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export const imageStorageKind = (): "blob" | "file" | "unavailable" => {
  if (process.env.BLOB_READ_WRITE_TOKEN) return "blob";
  return process.env.VERCEL === "1" ? "unavailable" : "file";
};

export const imageUploadAvailable = () => imageStorageKind() !== "unavailable";

/**
 * Confirms the bytes really are the image type they claim to be.
 *
 * A declared content type is just a header the caller chose, and these routes
 * sit behind a shared password rather than per-user accounts, so the file is
 * checked rather than trusted.
 */
export function sniffImageType(bytes: Uint8Array): string | null {
  const b = bytes;
  if (b.length < 12) return null;

  // JPEG: FF D8 FF
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 &&
      b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a) return "image/png";

  // RIFF....WEBP
  const ascii = (i: number, s: string) =>
    [...s].every((ch, k) => b[i + k] === ch.charCodeAt(0));
  if (ascii(0, "RIFF") && ascii(8, "WEBP")) return "image/webp";

  // ISO-BMFF box with an AVIF brand
  if (ascii(4, "ftyp") && (ascii(8, "avif") || ascii(8, "avis"))) return "image/avif";

  return null;
}

/** A filename that cannot escape its folder or collide with another upload. */
export function safeFileName(original: string, extension: string): string {
  const stem = original
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "photo";

  const suffix = Math.random().toString(36).slice(2, 8);
  return `${stem}-${suffix}.${extension}`;
}

/* ------------------------------------------------------------------ blob */

async function saveToBlob(bytes: Uint8Array, contentType: string, fileName: string): Promise<string> {
  const res = await fetch(`${BLOB_API}/products/${encodeURIComponent(fileName)}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
      "x-content-type": contentType,
      "x-api-version": "7",
      "x-add-random-suffix": "0",
      "x-cache-control-max-age": "31536000",
    },
    body: new Blob([bytes as unknown as BlobPart]),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Blob upload failed (${res.status}): ${await res.text()}`);
  }

  const data = (await res.json()) as { url?: string };
  if (!data.url) throw new Error("Blob upload returned no URL.");
  return data.url;
}

/* ------------------------------------------------------------------ file */

async function saveToFile(bytes: Uint8Array, fileName: string): Promise<string> {
  const { writeFile, mkdir } = await import("node:fs/promises");
  const path = await import("node:path");

  const dir = path.join(process.cwd(), "public", "media", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, fileName), bytes);
  return `/media/uploads/${fileName}`;
}

/* ---------------------------------------------------------------- public */

export async function saveImage(
  bytes: Uint8Array,
  contentType: string,
  originalName: string
): Promise<string> {
  const extension = ALLOWED_IMAGE_TYPES[contentType];
  if (!extension) throw new Error(`Unsupported image type: ${contentType}`);

  const fileName = safeFileName(originalName, extension);

  switch (imageStorageKind()) {
    case "blob":
      return saveToBlob(bytes, contentType, fileName);
    case "file":
      return saveToFile(bytes, fileName);
    default:
      throw new Error("No image storage is configured for this deployment.");
  }
}
