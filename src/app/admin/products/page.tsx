import { Package, ImageOff, Tag, ShieldQuestion, Download } from "lucide-react";
import { PRODUCTS } from "@/lib/products";
import { Stat } from "@/components/admin/Stat";
import { ProductsClient } from "@/components/admin/ProductsClient";

export const metadata = { title: "Products" };

const noPhoto = PRODUCTS.filter((p) => p.images.length === 0).length;
const noPrice = PRODUCTS.filter((p) => p.price === null).length;
const pending = PRODUCTS.filter((p) => p.nafdac_status === "pending").length;

export default function ProductsPage() {
  return (
    <div className="p-5 lg:p-7 max-w-[1700px]">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[1.75rem] text-[#123D2B] font-medium"
            style={{ fontFamily: "var(--font-heading)" }}>
            Products
          </h1>
          <p className="text-[13px] text-[#6b7265] mt-0.5" style={{ fontFamily: "var(--font-body)" }}>
            The whole catalogue, and what each product is still missing.
          </p>
        </div>

        <a href="/api/admin/products/export"
          className="inline-flex items-center gap-2 h-10 px-4 bg-white border border-[#E9E4D6] rounded-lg text-[12.5px] font-medium text-[#252B23] hover:border-[#175C3D] transition-colors"
          style={{ fontFamily: "var(--font-body)" }}>
          <Download size={14} /> Export CSV
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <Stat label="Products listed" value={String(PRODUCTS.length)} icon={Package}
          tint="#E8F0EA" color="#175C3D" />
        <Stat label="Waiting on a photo" value={String(noPhoto)} icon={ImageOff}
          tint="#FBF0DE" color="#B5713A" hint="Shows a placeholder until one arrives" />
        <Stat label="Price on enquiry" value={String(noPrice)} icon={Tag}
          tint="#FEF3C7" color="#92400E" hint="Cannot be bought through the cart" />
        <Stat label="NAFDAC pending" value={String(pending)} icon={ShieldQuestion}
          tint="#E7EEF6" color="#2563EB" hint="No registration claimed on the site" />
      </div>

      <section className="bg-white rounded-xl border border-[#E9E4D6] p-4">
        <ProductsClient />
      </section>

      <section className="mt-5 rounded-xl border border-[#E9E4D6] bg-[#FBF6EA] p-4 sm:p-5">
        <h2 className="text-[13.5px] font-semibold text-[#252B23] mb-1.5"
          style={{ fontFamily: "var(--font-body)" }}>
          Editing is not wired up yet, and that is a decision rather than an oversight
        </h2>
        <div className="space-y-2 text-[12.5px] leading-relaxed text-[#4a5247]"
          style={{ fontFamily: "var(--font-body)" }}>
          <p>
            The catalogue lives in the website&apos;s own code, which is why it loads instantly and
            costs nothing to serve. Code cannot be edited from a web page once the site is live,
            because the hosting filesystem is read-only.
          </p>
          <p>
            To change prices, photographs or stock from this screen, the catalogue has to move
            somewhere writable. The two sensible options are a Products tab in the same Google
            Sheet that already holds the orders, or a proper database. The sheet keeps everything
            in one place that is already familiar; a database scales better if the shop grows.
          </p>
          <p className="font-medium text-[#252B23]">
            Until that is decided, send price and photo changes to the developer and they go in
            with the next update.
          </p>
        </div>
      </section>
    </div>
  );
}
