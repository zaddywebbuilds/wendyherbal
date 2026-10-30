import { readdir } from "node:fs/promises";
import path from "node:path";

/**
 * Photographs already shipped with the site, offered to the admin product
 * form as choices.
 *
 * Only folders the site itself serves are listed, so a product can never be
 * pointed at a remote image: that would need the host allow-listed in
 * next.config and would let anyone with the admin password load third-party
 * content onto the shop.
 */
const FOLDERS = ["products", "brand"] as const;

export async function listSiteImages(): Promise<string[]> {
  const out: string[] = [];

  for (const folder of FOLDERS) {
    const dir = path.join(process.cwd(), "public", "media", folder);
    try {
      const entries = await readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isFile()) continue;
        if (!/\.(jpe?g|png|webp|avif)$/i.test(entry.name)) continue;
        out.push(`/media/${folder}/${entry.name}`);
      }
    } catch {
      // Folder absent in this deployment; nothing to offer from it.
    }
  }

  return out.sort();
}
