import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { ProductForm } from "@/components/admin/ProductForm";
import { listSiteImages } from "@/lib/media-files";
import { getCatalogueFresh } from "@/lib/catalogue";
import { loadOverlay, catalogueStorageIsDurable } from "@/lib/catalogue-store";

export const instant = false;

export default async function EditProductPage({ params }: { params: Promise<{ sku: string }> }) {
  await connection();
  const { sku } = await params;

  const catalogue = await getCatalogueFresh();
  const product = catalogue.find((p) => p.sku === sku);
  if (!product) notFound();

  const overlay = await loadOverlay();
  const isCreated = overlay.created.some((p) => p.sku === sku);
  const isEdited = Boolean(overlay.patches[sku]);

  return (
    <div className="p-5 lg:p-7 max-w-3xl">
      <Link href="/admin/products"
        className="inline-flex items-center gap-1.5 text-[12.5px] text-[#175C3D] mb-4 hover:underline"
        style={{ fontFamily: "var(--font-body)" }}>
        <ArrowLeft size={14} /> Back to products
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[1.75rem] text-[#123D2B] font-medium leading-tight"
            style={{ fontFamily: "var(--font-heading)" }}>
            {product.name}
          </h1>
          <p className="text-[12.5px] text-[#6b7265] mt-0.5" style={{ fontFamily: "var(--font-body)" }}>
            {product.sku}
            {isCreated && " · added in admin"}
            {isEdited && " · edited"}
          </p>
        </div>

        <Link href={`/product/${product.slug}`} target="_blank"
          className="inline-flex items-center gap-2 h-10 px-4 bg-white border border-[#E9E4D6] rounded-lg text-[12.5px] font-medium text-[#252B23] hover:border-[#175C3D] transition-colors"
          style={{ fontFamily: "var(--font-body)" }}>
          <ExternalLink size={14} /> View on website
        </Link>
      </div>

      <ProductForm
        product={product}
        availableImages={await listSiteImages()}
        durable={catalogueStorageIsDurable()}
        deletable={isCreated}
      />
    </div>
  );
}
