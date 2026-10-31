import Link from "next/link";
import { connection } from "next/server";
import { Boxes, AlertTriangle, HelpCircle, PackageCheck, Pencil } from "lucide-react";
import { Stat } from "@/components/admin/Stat";
import { getCatalogueFresh } from "@/lib/catalogue";
import { CATEGORY_LABELS } from "@/lib/products";

export const metadata = { title: "Inventory" };
export const instant = false;

const LOW_THRESHOLD = 8;

export default async function InventoryPage() {
  await connection();
  const products = await getCatalogueFresh();

  // stock_count 0 means "not counted yet", never "sold out". The two are kept
  // apart everywhere, because treating uncounted as zero would raise a
  // low-stock alarm on all 93 products at once.
  const uncounted = products.filter((p) => p.stock_count === 0);
  const low = products
    .filter((p) => p.stock_count > 0 && p.stock_count <= LOW_THRESHOLD)
    .sort((a, b) => a.stock_count - b.stock_count);
  const counted = products.filter((p) => p.stock_count > 0);
  const outOfStock = products.filter((p) => !p.in_stock);

  const rows = [...low, ...counted.filter((p) => p.stock_count > LOW_THRESHOLD)];

  return (
    <div className="p-5 lg:p-7 max-w-[1700px]">
      <div className="mb-6">
        <h1 className="text-[1.75rem] text-[#123D2B] font-medium"
          style={{ fontFamily: "var(--font-heading)" }}>
          Inventory
        </h1>
        <p className="text-[13px] text-[#6b7265] mt-0.5" style={{ fontFamily: "var(--font-body)" }}>
          Stock counts you have entered. Set a count on a product and it starts appearing here.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <Stat label="Products counted" value={String(counted.length)} icon={PackageCheck}
          tint="#E8F0EA" color="#175C3D" hint={`of ${products.length} in the catalogue`} />
        <Stat label="Running low" value={String(low.length)} icon={AlertTriangle}
          tint="#FEF3C7" color="#92400E" hint={`${LOW_THRESHOLD} or fewer left`} />
        <Stat label="Not counted yet" value={String(uncounted.length)} icon={HelpCircle}
          tint="#E7EEF6" color="#2563EB" hint="Shown as in stock, no alarm raised" />
        <Stat label="Marked out of stock" value={String(outOfStock.length)} icon={Boxes}
          tint="#FEE2E2" color="#991B1B" hint="Cannot be added to a bag" />
      </div>

      <section className="bg-white rounded-xl border border-[#E9E4D6] p-4">
        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center px-6">
            <Boxes size={30} className="text-[#A8B99C] mb-2.5" strokeWidth={1.4} />
            <p className="text-[13.5px] font-medium text-[#252B23]" style={{ fontFamily: "var(--font-body)" }}>
              No stock counts entered yet
            </p>
            <p className="text-[12px] text-[#A8B99C] mt-1 max-w-md leading-relaxed"
              style={{ fontFamily: "var(--font-body)" }}>
              Open any product and put a number in the stock field. Until you do, everything is
              treated as available and nothing is reported as low.
            </p>
            <Link href="/admin/products"
              className="mt-5 inline-flex items-center gap-2 h-10 px-4 bg-[#123D2B] text-white rounded-lg text-[12.5px] font-medium hover:bg-[#175C3D] transition-colors"
              style={{ fontFamily: "var(--font-body)" }}>
              Go to products
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left" style={{ fontFamily: "var(--font-body)" }}>
              <thead>
                <tr className="text-[10.5px] uppercase tracking-wider text-[#A8B99C] border-b border-[#EFE9DD]">
                  <th className="pb-2.5 font-semibold">Product</th>
                  <th className="pb-2.5 font-semibold">Collection</th>
                  <th className="pb-2.5 font-semibold text-right">In stock</th>
                  <th className="pb-2.5 font-semibold">State</th>
                  <th className="pb-2.5 font-semibold text-right">Edit</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => {
                  const isLow = p.stock_count <= LOW_THRESHOLD;
                  return (
                    <tr key={p.id} className="border-b border-[#F4F0E4] last:border-0 text-[12.5px]">
                      <td className="py-2.5">
                        <p className="font-medium text-[#252B23]">{p.name}</p>
                        <p className="text-[11px] text-[#A8B99C]">{p.sku}</p>
                      </td>
                      <td className="py-2.5 text-[#6b7265]">{CATEGORY_LABELS[p.category] ?? p.category}</td>
                      <td className="py-2.5 text-right tabular-nums font-semibold"
                        style={{ color: isLow ? "#B5713A" : "#123D2B" }}>
                        {p.stock_count}
                      </td>
                      <td className="py-2.5">
                        {!p.in_stock ? (
                          <span className="px-2 py-0.5 rounded-full bg-[#FEE2E2] text-[#991B1B] text-[10.5px] font-semibold">
                            Out of stock
                          </span>
                        ) : isLow ? (
                          <span className="px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] text-[10.5px] font-semibold">
                            Running low
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-[#D1FAE5] text-[#065F46] text-[10.5px] font-semibold">
                            Healthy
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 text-right">
                        <Link href={`/admin/products/${p.sku}`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#123D2B] text-white text-[11.5px] font-medium hover:bg-[#175C3D] transition-colors">
                          <Pencil size={12} /> Edit
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {uncounted.length > 0 && (
          <p className="mt-4 text-[11.5px] text-[#A8B99C] leading-relaxed"
            style={{ fontFamily: "var(--font-body)" }}>
            {uncounted.length} products have no count yet. They are treated as available and are
            deliberately left out of the low-stock figures, so a blank count never looks like an
            empty shelf.
          </p>
        )}
      </section>
    </div>
  );
}
