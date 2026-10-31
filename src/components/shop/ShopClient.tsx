"use client";
import { useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SlidersHorizontal, X, Search as SearchIcon, PackageX } from "lucide-react";
import Image from "next/image";
import { ProductCard } from "@/components/product/ProductCard";
import { CATEGORY_IMAGE } from "@/lib/media";
import { COLLECTIONS } from "@/lib/constants";
import { CATEGORY_LABELS } from "@/lib/products";
import { cn } from "@/lib/cn";
import type { Product } from "@/lib/types";

type Sort = "featured" | "price-asc" | "price-desc" | "name" | "newest";

const SORTS: { value: Sort; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name", label: "Alphabetical" },
  { value: "newest", label: "Newest" },
];

const PAGE_SIZE = 12;

export function ShopClient({ products: PRODUCTS }: { products: Product[] }) {
  const params = useSearchParams();
  const router = useRouter();

  const [category, setCategory] = useState<string>(params.get("category") ?? "all");
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [sort, setSort] = useState<Sort>("featured");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [buyableOnly, setBuyableOnly] = useState(false);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setCategory(params.get("category") ?? "all");
    setQuery(params.get("q") ?? "");
  }, [params]);

  // Brief skeleton so filter changes read as responsive rather than instant-jumpy
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 180);
    return () => clearTimeout(t);
  }, [category, query, sort, inStockOnly, buyableOnly]);

  const filtered = useMemo(() => {
    let out: Product[] = PRODUCTS.filter((p) => p.is_published);

    if (category !== "all") out = out.filter((p) => p.category === category);
    if (inStockOnly) out = out.filter((p) => p.in_stock);
    if (buyableOnly) out = out.filter((p) => !p.is_enquiry_only && typeof p.price === "number" && p.price > 0);

    const q = query.trim().toLowerCase();
    if (q) {
      out = out.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (CATEGORY_LABELS[p.category] ?? "").toLowerCase().includes(q)
      );
    }

    const priceOf = (p: Product) => (typeof p.price === "number" ? p.price : Number.POSITIVE_INFINITY);
    switch (sort) {
      case "price-asc": out = [...out].sort((a, b) => priceOf(a) - priceOf(b)); break;
      case "price-desc": out = [...out].sort((a, b) => priceOf(b) - priceOf(a)); break;
      case "name": out = [...out].sort((a, b) => a.name.localeCompare(b.name)); break;
      case "newest": out = [...out].sort((a, b) => b.created_at.localeCompare(a.created_at)); break;
    }
    return out;
  }, [category, query, sort, inStockOnly, buyableOnly]);

  const shown = filtered.slice(0, visible);
  useEffect(() => setVisible(PAGE_SIZE), [category, query, sort, inStockOnly, buyableOnly]);

  const activeChips = [
    category !== "all" && { label: CATEGORY_LABELS[category] ?? category, clear: () => { setCategory("all"); router.push("/shop"); } },
    query && { label: `"${query}"`, clear: () => { setQuery(""); router.push("/shop"); } },
    inStockOnly && { label: "In stock", clear: () => setInStockOnly(false) },
    buyableOnly && { label: "Available to buy", clear: () => setBuyableOnly(false) },
  ].filter(Boolean) as { label: string; clear: () => void }[];

  const Filters = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#123D2B] mb-2.5"
          style={{ fontFamily: "var(--font-body)" }}>Category</h3>
        <ul className="space-y-0.5">
          {[["all", "All Products"], ...Object.entries(CATEGORY_LABELS)].map(([val, label]) => {
            const count = val === "all"
              ? PRODUCTS.filter((p) => p.is_published).length
              : PRODUCTS.filter((p) => p.is_published && p.category === val).length;
            return (
              <li key={val}>
                <button onClick={() => { setCategory(val); setFiltersOpen(false); }}
                  className={cn("w-full flex items-center justify-between py-2.5 sm:py-1.5 text-[13px] transition-colors",
                    category === val ? "text-[#123D2B] font-semibold" : "text-[#6b7265] hover:text-[#123D2B]")}
                  style={{ fontFamily: "var(--font-body)" }}>
                  <span>{label}</span>
                  <span className="text-[11px] text-[#A8B99C]">{count}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="pt-5 border-t border-[#EFE9DD]">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#123D2B] mb-2.5"
          style={{ fontFamily: "var(--font-body)" }}>Availability</h3>
        <label className="flex items-center gap-2.5 py-1.5 cursor-pointer text-[13px] text-[#6b7265] hover:text-[#123D2B]"
          style={{ fontFamily: "var(--font-body)" }}>
          <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)}
            className="w-3.5 h-3.5 accent-[#123D2B]" />
          In stock only
        </label>
        <label className="flex items-center gap-2.5 py-1.5 cursor-pointer text-[13px] text-[#6b7265] hover:text-[#123D2B]"
          style={{ fontFamily: "var(--font-body)" }}>
          <input type="checkbox" checked={buyableOnly} onChange={(e) => setBuyableOnly(e.target.checked)}
            className="w-3.5 h-3.5 accent-[#123D2B]" />
          Available to buy online
        </label>
        <p className="mt-2 text-[10.5px] leading-relaxed text-[#A8B99C]" style={{ fontFamily: "var(--font-body)" }}>
          Items marked &ldquo;Enquire&rdquo; are awaiting product information approval before online sale.
        </p>
      </div>
    </div>
  );

  return (
    <div className="bg-[#F7F4E9] min-h-screen">
      {/* Page head. Choosing a collection gives it a banner rather than just
          swapping the heading, using the same photograph as its homepage card
          so the two read as one journey. */}
      {category === "all" || !CATEGORY_IMAGE[category] ? (
        <div className="bg-[#FCFAF3] border-b border-[#EFE9DD]">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-9">
            <h1 className="text-[2.1rem] lg:text-[2.6rem] text-[#123D2B] font-medium"
              style={{ fontFamily: "var(--font-heading)" }}>
              All Products
            </h1>
            <p className="text-[13px] text-[#6b7265] mt-1" style={{ fontFamily: "var(--font-body)" }}>
              {filtered.length} {filtered.length === 1 ? "product" : "products"}
            </p>
          </div>
        </div>
      ) : (
        <div className="relative border-b border-[#EFE9DD]">
          <div className="relative h-[200px] sm:h-[240px] lg:h-[280px] overflow-hidden">
            <Image src={CATEGORY_IMAGE[category].src} alt={CATEGORY_IMAGE[category].alt}
              fill priority sizes="100vw" className="object-cover" />
            <div aria-hidden className="absolute inset-0"
              style={{ background: "linear-gradient(90deg, rgba(9,28,19,0.88) 0%, rgba(9,28,19,0.62) 45%, rgba(9,28,19,0.25) 100%)" }} />

            <div className="relative h-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
              <p className="text-[10.5px] font-semibold tracking-[0.22em] uppercase text-[#C6A667] mb-2"
                style={{ fontFamily: "var(--font-body)" }}>
                Collection
              </p>
              <h1 className="text-[2.1rem] lg:text-[2.9rem] leading-[1.08] text-white font-medium"
                style={{ fontFamily: "var(--font-heading)" }}>
                {CATEGORY_LABELS[category] ?? "Shop"}
              </h1>
              {COLLECTIONS.find((c) => c.id === category)?.description && (
                <p className="mt-2.5 text-[13.5px] leading-relaxed text-white/80 max-w-md"
                  style={{ fontFamily: "var(--font-body)" }}>
                  {COLLECTIONS.find((c) => c.id === category)!.description}
                </p>
              )}
              <p className="mt-3 text-[12.5px] text-white/65" style={{ fontFamily: "var(--font-body)" }}>
                {filtered.length} {filtered.length === 1 ? "product" : "products"}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="grid lg:grid-cols-[220px_1fr] gap-7">
          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24"><Filters /></div>
          </aside>

          <div>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 mb-4">
              <button onClick={() => setFiltersOpen(true)}
                className="lg:hidden inline-flex items-center gap-1.5 px-3.5 h-11 sm:h-9 border border-[#E7E0CF] bg-white rounded-md text-[12.5px] text-[#252B23]"
                style={{ fontFamily: "var(--font-body)" }}>
                <SlidersHorizontal size={14} /> Filters
              </button>

              <div className="relative order-last w-full sm:order-none sm:w-auto sm:flex-1 sm:max-w-xs">
                <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8B99C] pointer-events-none" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} type="search"
                  placeholder="Search products..." aria-label="Filter products"
                  className="w-full h-11 sm:h-9 pl-8.5 pr-3 text-[16px] sm:text-[12.5px] bg-white border border-[#E7E0CF] rounded-md focus:outline-none focus:border-[#175C3D]"
                  style={{ fontFamily: "var(--font-body)", paddingLeft: "2.1rem" }} />
              </div>

              <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort products"
                className="ml-auto h-11 sm:h-9 px-3 text-[16px] sm:text-[12.5px] bg-white border border-[#E7E0CF] rounded-md text-[#252B23] focus:outline-none focus:border-[#175C3D] cursor-pointer"
                style={{ fontFamily: "var(--font-body)" }}>
                {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            {/* Active chips */}
            {activeChips.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {activeChips.map((c) => (
                  <button key={c.label} onClick={c.clear}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#123D2B]/8 text-[#123D2B] rounded-full text-[11.5px] hover:bg-[#123D2B]/15 transition-colors"
                    style={{ fontFamily: "var(--font-body)" }}>
                    {c.label} <X size={11} />
                  </button>
                ))}
                <button onClick={() => { setCategory("all"); setQuery(""); setInStockOnly(false); setBuyableOnly(false); router.push("/shop"); }}
                  className="text-[11.5px] text-[#6b7265] hover:text-[#123D2B] underline underline-offset-2"
                  style={{ fontFamily: "var(--font-body)" }}>
                  Clear all
                </button>
              </div>
            )}

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-lg border border-[#EFE9DD] overflow-hidden animate-pulse">
                    <div className="aspect-square bg-[#EFE9DD]" />
                    <div className="p-3 space-y-2">
                      <div className="h-2 bg-[#EFE9DD] rounded w-1/2" />
                      <div className="h-3 bg-[#EFE9DD] rounded w-full" />
                      <div className="h-3 bg-[#EFE9DD] rounded w-2/3" />
                      <div className="h-9 bg-[#EFE9DD] rounded mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <PackageX size={40} className="text-[#A8B99C] mb-3" strokeWidth={1.3} />
                <p className="text-[15px] text-[#252B23] font-medium" style={{ fontFamily: "var(--font-body)" }}>
                  No products match your filters
                </p>
                <p className="text-[13px] text-[#6b7265] mt-1 max-w-sm" style={{ fontFamily: "var(--font-body)" }}>
                  Try a different search term or clear your filters to see everything.
                </p>
                <button onClick={() => { setCategory("all"); setQuery(""); setInStockOnly(false); setBuyableOnly(false); router.push("/shop"); }}
                  className="mt-4 px-6 py-2.5 bg-[#123D2B] text-white text-[13px] font-medium rounded-md hover:bg-[#175C3D] transition-colors"
                  style={{ fontFamily: "var(--font-body)" }}>
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {shown.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>
                {visible < filtered.length && (
                  <div className="flex justify-center mt-8">
                    <button onClick={() => setVisible((v) => v + PAGE_SIZE)}
                      className="px-8 py-3 border border-[#123D2B]/30 text-[#123D2B] text-[13px] font-medium rounded-md hover:bg-[#123D2B] hover:text-white transition-colors"
                      style={{ fontFamily: "var(--font-body)" }}>
                      Load More ({filtered.length - visible} remaining)
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter sheet */}
      <div className={cn("fixed inset-0 z-[65] lg:hidden transition-opacity duration-300",
        filtersOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")}>
        <div className="absolute inset-0 bg-[#123D2B]/50" onClick={() => setFiltersOpen(false)} />
        <div className={cn("absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto bg-[#F7F4E9] rounded-t-2xl p-5 transition-transform duration-300",
          filtersOpen ? "translate-y-0" : "translate-y-full")}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[1.2rem] text-[#123D2B]" style={{ fontFamily: "var(--font-heading)" }}>Filters</h2>
            <button onClick={() => setFiltersOpen(false)} aria-label="Close filters" className="-m-2 p-2 text-[#252B23]">
              <X size={18} />
            </button>
          </div>
          <Filters />
        </div>
      </div>
    </div>
  );
}
