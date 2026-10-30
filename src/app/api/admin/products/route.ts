import { NextResponse } from "next/server";
import { mutateOverlay, catalogueStorageIsDurable, type CreatedProduct } from "@/lib/catalogue-store";
import { getCatalogueFresh } from "@/lib/catalogue";
import { revalidateCatalogue } from "@/lib/catalogue-revalidate";
import { parseProductInput, slugify } from "@/lib/product-input";

/** Creates a product that exists only in the store, never in code. */
export async function POST(req: Request) {
  if (!catalogueStorageIsDurable()) {
    return NextResponse.json(
      {
        error:
          "Changes would not survive a restart. Add a KV store (Upstash Redis) in Vercel first, " +
          "otherwise anything you save here disappears on the next cold start.",
      },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = parseProductInput(body, { requireName: true });
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const input = parsed.value;

  const existing = await getCatalogueFresh();
  const baseSlug = slugify(input.name!);
  if (!baseSlug) return NextResponse.json({ error: "That name cannot be used." }, { status: 400 });

  // Slugs are URLs, so they have to stay unique across code and store alike.
  let slug = baseSlug;
  for (let i = 2; existing.some((p) => p.slug === slug); i += 1) slug = `${baseSlug}-${i}`;

  const overlay = await mutateOverlay((o) => {
    const used = new Set([...existing.map((p) => p.sku), ...o.created.map((p) => p.sku)]);
    let n = o.created.length + 1;
    let sku = `WH-N-${String(n).padStart(3, "0")}`;
    while (used.has(sku)) {
      n += 1;
      sku = `WH-N-${String(n).padStart(3, "0")}`;
    }

    const product: CreatedProduct = {
      id: `new-${sku.toLowerCase()}`,
      sku,
      name: input.name!,
      slug,
      category: input.category!,
      description: input.description ?? `${input.name} from Wendy Herbals.`,
      price: input.price ?? null,
      images: input.images ?? [],
      in_stock: input.in_stock ?? true,
      stock_count: input.stock_count ?? 0,
      includes_balm: /\b(balm|cream)\b/i.test(input.name!),
      ingredients: input.ingredients,
      storage_info: input.storage_info,
      // Added by hand, so nothing is claimed about its regulatory status.
      nafdac_status: "pending",
      is_published: input.is_published ?? true,
      is_enquiry_only: (input.price ?? null) === null,
      created_at: new Date().toISOString(),
    };

    o.created.unshift(product);
    return o;
  });

  const created = overlay.created[0];
  revalidateCatalogue([created.slug]);

  return NextResponse.json({ product: created }, { status: 201 });
}
