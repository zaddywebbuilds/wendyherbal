import { NextResponse } from "next/server";
import { mutateOverlay, catalogueStorageIsDurable, type ProductPatch } from "@/lib/catalogue-store";
import { getCatalogueFresh } from "@/lib/catalogue";
import { revalidateCatalogue } from "@/lib/catalogue-revalidate";
import { parseProductInput } from "@/lib/product-input";

function notDurable() {
  return NextResponse.json(
    {
      error:
        "Changes would not survive a restart. Add a KV store (Upstash Redis) in Vercel first, " +
        "otherwise anything you save here disappears on the next cold start.",
    },
    { status: 503 }
  );
}

/** Saves an edit. Works for coded products and ones added in admin alike. */
export async function PUT(req: Request, { params }: { params: Promise<{ sku: string }> }) {
  if (!catalogueStorageIsDurable()) return notDurable();

  const { sku } = await params;
  const catalogue = await getCatalogueFresh();
  const before = catalogue.find((p) => p.sku === sku);
  if (!before) {
    return NextResponse.json({ error: "No product with that SKU." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = parseProductInput(body, { requireName: false });
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  await mutateOverlay((o) => {
    const created = o.created.find((p) => p.sku === sku);
    if (created) {
      // Products that live only here are edited in place; a patch as well
      // would be two sources of truth for the same field.
      Object.assign(created, parsed.value);
      created.is_enquiry_only = created.price === null;
      return o;
    }

    const patch: ProductPatch = {
      ...(o.patches[sku] ?? {}),
      ...parsed.value,
      updatedAt: new Date().toISOString(),
    };
    o.patches[sku] = patch;
    return o;
  });

  const after = (await getCatalogueFresh()).find((p) => p.sku === sku);
  revalidateCatalogue([before.slug, after?.slug].filter((s): s is string => Boolean(s)));
  return NextResponse.json({ ok: true });
}

/**
 * Removes a product added in admin, or clears the edits on a coded one so it
 * goes back to exactly what the code says. A coded product is never deleted:
 * hide it instead by unticking "show on the website".
 */
export async function DELETE(_req: Request, { params }: { params: Promise<{ sku: string }> }) {
  if (!catalogueStorageIsDurable()) return notDurable();

  const { sku } = await params;
  const before = (await getCatalogueFresh()).find((p) => p.sku === sku);
  let outcome: "deleted" | "reset" | "nothing" = "nothing";

  await mutateOverlay((o) => {
    const idx = o.created.findIndex((p) => p.sku === sku);
    if (idx >= 0) {
      o.created.splice(idx, 1);
      o.removed = o.removed.filter((s) => s !== sku);
      outcome = "deleted";
      return o;
    }
    if (o.patches[sku]) {
      delete o.patches[sku];
      outcome = "reset";
    }
    return o;
  });

  revalidateCatalogue(before ? [before.slug] : []);
  return NextResponse.json({ ok: true, outcome });
}
