"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search as SearchIcon, ExternalLink, ImageOff, Tag, Pencil } from "lucide-react";
import { CATEGORY_LABELS } from "@/lib/products";
import { FORMAT_NGN } from "@/lib/constants";
import { cn } from "@/lib/cn";
import type { Product } from "@/lib/types";

type Gap = "all" | "no-photo" | "no-price" | "nafdac";

const GAPS: { value: Gap; label: string; test: (p: Product) => boolean }[] = [
  { value: "all", label: "All", test: () => true },
  { value: "no-photo", label: "No photo", test: (p) => p.images.length === 0 },
  { value: "no-price", label: "No price", test: (p) => p.price === null },
  { value: "nafdac", label: "NAFDAC pending", test: (p) => p.nafdac_status === "pending" },
];

const NAFDAC_TONE: Record<string, { bg: string; fg: string; label: string }> = {
  approved: { bg: "#D1FAE5", fg: "#065F46", label: "Approved" },
  pending: { bg: "#FEF3C7", fg: "#92400E", label: "Pending" },
  not_applicable: { bg: "#F3F4F6", fg: "#6B7280", label: "Not applicable" },
};

export function ProductsClient({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [gap, setGap] = useState<Gap>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const gapTest = GAPS.find((g) => g.value === gap)!.test;
    return products.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (!gapTest(p)) return false;
      if (!q) return true;
      return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    });
  }, [query, category, gap]);

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2.5 mb-4">
        <div className="relative order-last w-full sm:order-none sm:w-auto sm:flex-1 sm:max-w-xs">
          <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8B99C] pointer-events-none" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} type="search"
            placeholder="Search name or SKU..." aria-label="Search products"
            className="w-full h-11 sm:h-9 pr-3 text-[16px] sm:text-[12.5px] bg-white border border-[#E9E4D6] rounded-lg focus:outline-none focus:border-[#175C3D]"
            style={{ fontFamily: "var(--font-body)", paddingLeft: "2.1rem" }} />
        </div>

        <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by category"
          className="h-11 sm:h-9 px-3 text-[16px] sm:text-[12.5px] bg-white border border-[#E9E4D6] rounded-lg text-[#252B23] focus:outline-none focus:border-[#175C3D]"
          style={{ fontFamily: "var(--font-body)" }}>
          <option value="all">All categories</option>
          {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>

        <div className="flex flex-wrap gap-1.5">
          {GAPS.map((g) => {
            const count = products.filter(g.test).length;
            return (
              <button key={g.value} onClick={() => setGap(g.value)}
                className={cn(
                  "h-11 sm:h-9 px-3 rounded-lg text-[12.5px] font-medium border transition-colors",
                  gap === g.value
                    ? "bg-[#123D2B] text-white border-[#123D2B]"
                    : "bg-white text-[#252B23] border-[#E9E4D6] hover:border-[#175C3D]"
                )}
                style={{ fontFamily: "var(--font-body)" }}>
                {g.label} <span className="tabular-nums opacity-70">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-[12px] text-[#6b7265] mb-3" style={{ fontFamily: "var(--font-body)" }}>
        Showing {filtered.length} of {products.length}
      </p>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-[13px] text-[#A8B99C]" style={{ fontFamily: "var(--font-body)" }}>
          Nothing matches those filters.
        </p>
      ) : (
        <>
          {/* Table on a laptop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left" style={{ fontFamily: "var(--font-body)" }}>
              <thead>
                <tr className="text-[10.5px] uppercase tracking-wider text-[#A8B99C] border-b border-[#EFE9DD]">
                  <th className="pb-2.5 pr-4 font-semibold">Product</th>
                  <th className="pb-2.5 pr-4 font-semibold">Collection</th>
                  {/* pr-6: the price is right-aligned and Photo is left-aligned,
                      so without it they render as one run of text. */}
                  <th className="pb-2.5 pr-6 font-semibold text-right">Price</th>
                  <th className="pb-2.5 pr-4 font-semibold">Photo</th>
                  <th className="pb-2.5 pr-4 font-semibold">NAFDAC</th>
                  <th className="pb-2.5 font-semibold text-right">Edit</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <Row key={p.id} product={p} />
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards on a phone */}
          <ul className="md:hidden space-y-2.5">
            {filtered.map((p) => (
              <Card key={p.id} product={p} />
            ))}
          </ul>
        </>
      )}
    </>
  );
}

function Thumb({ product }: { product: Product }) {
  const src = product.images[0];
  if (!src) {
    return (
      <span className="w-11 h-11 rounded-md bg-[#F4F0E4] flex items-center justify-center shrink-0">
        <ImageOff size={15} className="text-[#A8B99C]" strokeWidth={1.6} />
      </span>
    );
  }
  return (
    <span className="relative w-11 h-11 rounded-md overflow-hidden bg-[#F4F0E4] shrink-0">
      <Image src={src} alt="" fill sizes="44px" className="object-cover" />
    </span>
  );
}

function Price({ product }: { product: Product }) {
  if (product.price === null) {
    return (
      <span className="inline-flex items-center gap-1 text-[#B5713A] font-medium">
        <Tag size={12} /> On enquiry
      </span>
    );
  }
  return <span className="tabular-nums font-semibold text-[#123D2B]">{FORMAT_NGN(product.price)}</span>;
}

function Nafdac({ product }: { product: Product }) {
  const tone = NAFDAC_TONE[product.nafdac_status ?? "pending"] ?? NAFDAC_TONE.pending;
  return (
    <span className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold whitespace-nowrap"
      style={{ background: tone.bg, color: tone.fg }}>
      {tone.label}
    </span>
  );
}

function Row({ product }: { product: Product }) {
  return (
    <tr className="border-b border-[#F4F0E4] last:border-0 text-[12.5px]">
      <td className="py-2.5 pr-4">
        <div className="flex items-center gap-3">
          <Thumb product={product} />
          <div className="min-w-0">
            <p className="font-medium text-[#252B23] truncate">{product.name}</p>
            <p className="text-[11px] text-[#A8B99C]">{product.sku}</p>
          </div>
        </div>
      </td>
      <td className="py-2.5 pr-4 text-[#6b7265]">{CATEGORY_LABELS[product.category]}</td>
      <td className="py-2.5 pr-6 text-right"><Price product={product} /></td>
      <td className="py-2.5 pr-4">
        {product.images.length > 0 ? (
          <span className="text-[#175C3D]">Yes</span>
        ) : (
          <span className="text-[#B5713A]">Pending</span>
        )}
      </td>
      <td className="py-2.5 pr-4"><Nafdac product={product} /></td>
      <td className="py-2.5 text-right whitespace-nowrap">
        <Link href={`/admin/products/${product.sku}`}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#123D2B] text-white text-[11.5px] font-medium hover:bg-[#175C3D] transition-colors">
          <Pencil size={12} /> Edit
        </Link>
        <Link href={`/product/${product.slug}`} target="_blank" aria-label={`View ${product.name} on the website`}
          className="ml-1.5 inline-flex items-center justify-center w-7 h-7 rounded-md bg-[#E8F0EA] text-[#175C3D] hover:bg-[#d8e6dd] transition-colors">
          <ExternalLink size={12} />
        </Link>
      </td>
    </tr>
  );
}

function Card({ product }: { product: Product }) {
  return (
    <li className="rounded-lg border border-[#EFE9DD] p-3" style={{ fontFamily: "var(--font-body)" }}>
      <div className="flex items-start gap-3">
        <Thumb product={product} />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium text-[#252B23]">{product.name}</p>
          <p className="text-[11px] text-[#A8B99C]">
            {product.sku} · {CATEGORY_LABELS[product.category]}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px]">
            <Price product={product} />
            <Nafdac product={product} />
            {product.images.length === 0 && (
              <span className="inline-flex items-center gap-1 text-[11.5px] text-[#B5713A]">
                <ImageOff size={11} /> No photo
              </span>
            )}
          </div>
        </div>
        <div className="shrink-0 flex flex-col gap-1.5">
          <Link href={`/admin/products/${product.sku}`} aria-label={`Edit ${product.name}`}
            className="w-9 h-9 rounded-md bg-[#123D2B] text-white flex items-center justify-center">
            <Pencil size={14} />
          </Link>
          <Link href={`/product/${product.slug}`} target="_blank"
            aria-label={`Open ${product.name} on the website`}
            className="w-9 h-9 rounded-md bg-[#E8F0EA] text-[#175C3D] flex items-center justify-center">
            <ExternalLink size={14} />
          </Link>
        </div>
      </div>
    </li>
  );
}

