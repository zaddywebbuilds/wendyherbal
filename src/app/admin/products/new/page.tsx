import Link from "next/link";
import { connection } from "next/server";
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "@/components/admin/ProductForm";
import { listSiteImages } from "@/lib/media-files";
import { catalogueStorageIsDurable } from "@/lib/catalogue-store";

export const metadata = { title: "Add a product" };
export const instant = false;

export default async function NewProductPage() {
  await connection();

  const availableImages = await listSiteImages();
  const durable = catalogueStorageIsDurable();

  return (
    <div className="p-5 lg:p-7 max-w-3xl">
      <Link href="/admin/products"
        className="inline-flex items-center gap-1.5 text-[12.5px] text-[#175C3D] mb-4 hover:underline"
        style={{ fontFamily: "var(--font-body)" }}>
        <ArrowLeft size={14} /> Back to products
      </Link>

      <h1 className="text-[1.75rem] text-[#123D2B] font-medium mb-1"
        style={{ fontFamily: "var(--font-heading)" }}>
        Add a product
      </h1>
      <p className="text-[13px] text-[#6b7265] mb-6" style={{ fontFamily: "var(--font-body)" }}>
        It appears on the website as soon as you save, as long as &ldquo;Show on the
        website&rdquo; is ticked.
      </p>

      <ProductForm availableImages={availableImages} durable={durable} deletable />
    </div>
  );
}
