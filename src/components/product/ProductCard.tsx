"use client";
import Link from "next/link";
import { Heart, ShoppingCart, MessageCircle } from "lucide-react";
import { ProductImage } from "@/components/ui/ProductImage";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { CATEGORY_LABELS } from "@/lib/products";
import { FORMAT_NGN, WHATSAPP_URL } from "@/lib/constants";
import { cn } from "@/lib/cn";
import type { Product } from "@/lib/types";
import { useEffect, useState } from "react";

interface Props {
  product: Product;
  badge?: "New" | "Bestseller" | null;
  className?: string;
}

export function ProductCard({ product, badge, className }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const wishIds = useWishlistStore((s) => s.ids);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const wished = mounted && wishIds.includes(product.id);
  // With sizes, the card quotes the cheapest and says so; the size itself is
  // chosen on the product page, so the card links through rather than adding
  // straight to the bag.
  const hasSizes = Boolean(product.variants?.length);
  const price = typeof product.price === "number" && product.price > 0 ? product.price : null;
  const canBuy = price !== null && !product.is_enquiry_only && product.in_stock && !hasSizes;

  const enquiryHref = `${WHATSAPP_URL}?text=${encodeURIComponent(
    `Hello Wendy Herbals, I would like information about: ${product.name} (${product.sku}).`
  )}`;

  return (
    <div className={cn(
      "group relative flex flex-col bg-white rounded-xl border border-[#EFE9DD] overflow-hidden transition-all duration-300 hover:border-[#C6A667]/50 hover:shadow-[0_14px_36px_-18px_rgba(18,61,43,0.18)]",
      className
    )}>
      {/* Badge */}
      {badge && (
        <span className={cn(
          "absolute top-2.5 left-2.5 z-10 px-2 py-0.5 rounded text-[10px] font-semibold text-white tracking-wide",
          badge === "New" ? "bg-[#175C3D]" : "bg-[#C06014]"
        )} style={{ fontFamily: "var(--font-body)" }}>
          {badge}
        </span>
      )}

      {/* Wishlist */}
      <button
        onClick={() => toggleWishlist(product.id)}
        aria-label={wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        aria-pressed={wished}
        className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm border border-[#EFE9DD] flex items-center justify-center transition-colors hover:border-[#C6A667]"
      >
        <Heart size={13} className={cn("transition-colors", wished ? "fill-[#C06014] text-[#C06014]" : "text-[#6b7265]")} />
      </button>

      {/* Image */}
      {/* Redundant with the product-name link below, so it is taken out of the
          tab order and hidden from screen readers rather than read as an
          unnamed link. */}
      <Link href={`/product/${product.slug}`} className="block" tabIndex={-1} aria-hidden="true">
        <ProductImage src={product.images[0]} alt={product.name} category={product.category}
          className="aspect-square" sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 20vw" />
      </Link>

      {/* Body */}
      <div className="flex flex-col flex-1 p-3">
        <p className="text-[9.5px] uppercase tracking-[0.1em] text-[#A8B99C] font-medium mb-1"
          style={{ fontFamily: "var(--font-body)" }}>
          {CATEGORY_LABELS[product.category] ?? product.category}
        </p>

        <Link href={`/product/${product.slug}`}
          className="text-[13px] font-medium text-[#252B23] leading-snug hover:text-[#123D2B] transition-colors line-clamp-2 min-h-[2.4em]"
          style={{ fontFamily: "var(--font-body)" }}>
          {product.name}
        </Link>

        {product.includes_balm && (
          <p className="mt-1 text-[10px] text-[#175C3D]" style={{ fontFamily: "var(--font-body)" }}>
            Includes matching balm
          </p>
        )}

        <div className="mt-auto pt-2.5">
          {price !== null ? (
            <p className="text-[15px] font-bold text-[#123D2B]" style={{ fontFamily: "var(--font-body)" }}>
              {FORMAT_NGN(price)}
            </p>
          ) : (
            <p className="text-[12px] font-medium text-[#6b7265]" style={{ fontFamily: "var(--font-body)" }}>
              Price on enquiry
            </p>
          )}

          {!product.in_stock && (
            <p className="mt-0.5 text-[10px] text-[#C06014] font-medium" style={{ fontFamily: "var(--font-body)" }}>
              Out of stock
            </p>
          )}

          {canBuy ? (
            <button
              onClick={() => addItem(product, 1)}
              className="mt-2.5 w-full h-9 flex items-center justify-center gap-1.5 bg-[#123D2B] text-white text-[12px] font-medium rounded-md hover:bg-[#175C3D] transition-colors active:scale-[0.98]"
              style={{ fontFamily: "var(--font-body)" }}>
              <ShoppingCart size={13} /> Add to Cart
            </button>
          ) : (
            <a
              href={enquiryHref} target="_blank" rel="noopener noreferrer"
              className="mt-2.5 w-full h-9 flex items-center justify-center gap-1.5 border border-[#123D2B]/30 text-[#123D2B] text-[12px] font-medium rounded-md hover:bg-[#123D2B] hover:text-white hover:border-[#123D2B] transition-colors active:scale-[0.98]"
              style={{ fontFamily: "var(--font-body)" }}>
              <MessageCircle size={13} /> Enquire
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
