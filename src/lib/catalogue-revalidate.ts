import { revalidateTag, revalidatePath } from "next/cache";
import { CATALOGUE_TAG } from "./catalogue";

/**
 * Purges every cached view of the catalogue after an admin write.
 *
 * Both mechanisms are used on purpose. The tag covers anything reading
 * getCatalogue(); the path purges reach the prerendered shop and product
 * pages, which a tag purge alone was observed not to refresh in this Next
 * version. A shop page showing one price while checkout charges another is
 * the failure this guards against.
 */
export function revalidateCatalogue(slugs: string[] = []): void {
  revalidateTag(CATALOGUE_TAG, "max");
  revalidatePath("/", "page");
  revalidatePath("/shop", "page");
  revalidatePath("/product/[slug]", "page");
  for (const slug of slugs) revalidatePath(`/product/${slug}`, "page");
}
