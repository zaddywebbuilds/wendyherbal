import Link from "next/link";
import { connection } from "next/server";
import { Package, ImageOff, Tag, ShieldQuestion, Download, Plus, AlertTriangle } from "lucide-react";
import { Stat } from "@/components/admin/Stat";
import { ProductsClient } from "@/components/admin/ProductsClient";
import { getCatalogueFresh } from "@/lib/catalogue";
import { catalogueStorageIsDurable, catalogueStorageKind } from "@/lib/catalogue-store";

export const metadata = { title: "Products" };
export const instant = false;

export default async function ProductsPage() {
  await connection();

  const products = await getCatalogueFresh();
  const noPhoto = products.filter((p) => p.images.length === 0).length;
  const noPrice = products.filter((p) => p.price === null).length;
  const pending = products.filter((p) => p.nafdac_status === "pending").length;
  const durable = catalogueStorageIsDurable();

  return (
    <div className="p-5 lg:p-7 max-w-[1700px]">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[1.75rem] text-[#123D2B] font-medium"
            style={{ fontFamily: "var(--font-heading)" }}>
            Products
          </h1>
          <p className="text-[13px] text-[#6b7265] mt-0.5" style={{ fontFamily: "var(--font-body)" }}>
            Tap any product to change its price, stock or photographs.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link href="/admin/products/new"
            className="inline-flex items-center gap-2 h-10 px-4 bg-[#123D2B] text-white rounded-lg text-[12.5px] font-semibold hover:bg-[#175C3D] transition-colors"
            style={{ fontFamily: "var(--font-body)" }}>
            <Plus size={15} /> Add product
          </Link>
          <a href="/api/admin/products/export"
            className="inline-flex items-center gap-2 h-10 px-4 bg-white border border-[#E9E4D6] rounded-lg text-[12.5px] font-medium text-[#252B23] hover:border-[#175C3D] transition-colors"
            style={{ fontFamily: "var(--font-body)" }}>
            <Download size={14} /> Export CSV
          </a>
        </div>
      </div>

      {!durable && (
        <div className="mb-5 rounded-xl border-l-[3px] border-[#92400E] bg-[#FEF3C7] p-4 flex gap-3"
          style={{ fontFamily: "var(--font-body)" }}>
          <AlertTriangle size={17} className="shrink-0 mt-[2px] text-[#92400E]" />
          <div className="text-[12.5px] leading-relaxed text-[#92400E]">
            <p className="font-semibold">Editing is switched off here</p>
            <p>
              This deployment has nowhere durable to save changes
              {catalogueStorageKind() === "ephemeral"
                ? ", because Vercel's filesystem is wiped on every cold start"
                : ""}
              . Add a KV store (Upstash Redis) in Vercel and set KV_REST_API_URL and
              KV_REST_API_TOKEN, then editing starts working. Nothing is lost in the meantime:
              the catalogue in code is untouched.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <Stat label="Products listed" value={String(products.length)} icon={Package}
          tint="#E8F0EA" color="#175C3D" />
        <Stat label="Waiting on a photo" value={String(noPhoto)} icon={ImageOff}
          tint="#FBF0DE" color="#B5713A" hint="Shows a placeholder until one arrives" />
        <Stat label="Price on enquiry" value={String(noPrice)} icon={Tag}
          tint="#FEF3C7" color="#92400E" hint="Cannot be bought through the cart" />
        <Stat label="NAFDAC pending" value={String(pending)} icon={ShieldQuestion}
          tint="#E7EEF6" color="#2563EB" hint="No registration claimed on the site" />
      </div>

      <section className="bg-white rounded-xl border border-[#E9E4D6] p-4">
        <ProductsClient products={products} />
      </section>
    </div>
  );
}
