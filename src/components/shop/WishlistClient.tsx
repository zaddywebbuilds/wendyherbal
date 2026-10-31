"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { useWishlistStore } from "@/store/wishlist";
import type { Product } from "@/lib/types";

/**
 * Saved items, held in the browser only.
 *
 * The list lives in localStorage under `wendy-herbals-wishlist`, the same
 * store the heart on each product card writes to. Nothing is sent to the shop,
 * which is why this needs no account and why the Privacy Policy can say the
 * wishlist never leaves the device.
 */
export function WishlistClient({ products }: { products: Product[] }) {
  const ids = useWishlistStore((s) => s.ids);
  const clear = useWishlistStore((s) => s.clear);

  // Nothing is in localStorage during server rendering, so the list is only
  // trustworthy after mount; until then the page would flash an empty state.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const saved = mounted ? products.filter((p) => ids.includes(p.id)) : [];

  if (!mounted) {
    return <div className="min-h-[40vh]" aria-hidden />;
  }

  if (saved.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-6">
        <Heart size={34} className="text-[#A8B99C] mb-3" strokeWidth={1.4} />
        <p className="text-[15px] font-medium text-[#252B23]" style={{ fontFamily: "var(--font-body)" }}>
          Nothing saved yet
        </p>
        <p className="mt-1.5 text-[13px] text-[#6b7265] max-w-sm leading-relaxed"
          style={{ fontFamily: "var(--font-body)" }}>
          Tap the heart on any product to keep it here while you decide. Your saved items stay on
          this device and are not sent to us.
        </p>
        <Link href="/shop"
          className="group mt-6 inline-flex items-center gap-2 px-6 py-3 bg-[#123D2B] text-white text-[13px] font-medium rounded-md hover:bg-[#175C3D] transition-colors"
          style={{ fontFamily: "var(--font-body)" }}>
          Browse the shop
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <p className="text-[13px] text-[#6b7265]" style={{ fontFamily: "var(--font-body)" }}>
          {saved.length} saved {saved.length === 1 ? "item" : "items"}
        </p>
        <button onClick={clear}
          className="h-9 px-3.5 rounded-md border border-[#E7E0CF] bg-white text-[12.5px] text-[#252B23] hover:border-[#175C3D] transition-colors"
          style={{ fontFamily: "var(--font-body)" }}>
          Clear all
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {saved.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </>
  );
}
