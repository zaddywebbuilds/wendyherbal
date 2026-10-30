"use client";
import Link from "next/link";
import { useState } from "react";
import { ChevronRight, Minus, Plus, ShoppingCart, MessageCircle, Heart, Truck, ShieldAlert, Package } from "lucide-react";
import { ProductImage } from "@/components/ui/ProductImage";
import { ProductCard } from "@/components/product/ProductCard";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { CATEGORY_LABELS } from "@/lib/products";
import { FORMAT_NGN, WHATSAPP_URL } from "@/lib/constants";
import { cn } from "@/lib/cn";
import type { Product } from "@/lib/types";

const TABS = ["Product Information", "Ingredients", "Storage & Safety", "Delivery"] as const;
type Tab = typeof TABS[number];

export function ProductDetail({ product, related }: { product: Product; related: Product[] }) {
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<Tab>("Product Information");
  const [activeImg, setActiveImg] = useState(0);

  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const wished = useWishlistStore((s) => s.ids.includes(product.id));

  const price = typeof product.price === "number" && product.price > 0 ? product.price : null;
  const canBuy = price !== null && !product.is_enquiry_only && product.in_stock;

  const enquiryHref = `${WHATSAPP_URL}?text=${encodeURIComponent(
    `Hello Wendy Herbals, I would like information about: ${product.name} (${product.sku}).`
  )}`;

  return (
    <div className="bg-[#F7F4E9]">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-9">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[12px] text-[#6b7265] mb-5 flex-wrap"
          style={{ fontFamily: "var(--font-body)" }}>
          <Link href="/" className="hover:text-[#123D2B]">Home</Link>
          <ChevronRight size={12} className="text-[#A8B99C]" />
          <Link href="/shop" className="hover:text-[#123D2B]">Shop</Link>
          <ChevronRight size={12} className="text-[#A8B99C]" />
          <Link href={`/shop?category=${product.category}`} className="hover:text-[#123D2B]">
            {CATEGORY_LABELS[product.category]}
          </Link>
          <ChevronRight size={12} className="text-[#A8B99C]" />
          <span className="text-[#252B23] font-medium">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-[55fr_45fr] gap-8 lg:gap-11">
          {/* ---------- Gallery ---------- */}
          <div className="min-w-0">
            <div className="group rounded-xl overflow-hidden bg-white border border-[#EFE9DD]">
              <ProductImage src={product.images[activeImg]} alt={product.name} category={product.category}
                className="aspect-square" sizes="(max-width:1024px) 100vw, 55vw" priority />
            </div>
            {product.images.length > 1 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {product.images.map((img, i) => (
                  <button key={img} onClick={() => setActiveImg(i)}
                    aria-label={`View image ${i + 1}`}
                    className={cn("w-16 h-16 rounded-md overflow-hidden border-2 transition-colors",
                      activeImg === i ? "border-[#123D2B]" : "border-[#EFE9DD] hover:border-[#C6A667]")}>
                    <ProductImage src={img} alt="" category={product.category} className="w-full h-full" sizes="64px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ---------- Info ---------- */}
          {/* min-w-0: the tab row is nowrap, and without this the grid track
              grows to its min-content width and the page scrolls sideways. */}
          <div className="min-w-0">
            <p className="text-[10.5px] uppercase tracking-[0.14em] text-[#A8B99C] font-medium mb-2"
              style={{ fontFamily: "var(--font-body)" }}>
              {CATEGORY_LABELS[product.category]} &middot; {product.sku}
            </p>

            <h1 className="text-[1.9rem] lg:text-[2.4rem] text-[#123D2B] font-medium leading-tight"
              style={{ fontFamily: "var(--font-heading)" }}>
              {product.name}
            </h1>

            <div className="mt-4">
              {price !== null ? (
                <p className="text-[1.6rem] font-bold text-[#123D2B]" style={{ fontFamily: "var(--font-body)" }}>
                  {FORMAT_NGN(price)}
                </p>
              ) : (
                <p className="text-[15px] font-medium text-[#6b7265]" style={{ fontFamily: "var(--font-body)" }}>
                  Price available on enquiry
                </p>
              )}
              <p className={cn("text-[12.5px] mt-1", product.in_stock ? "text-[#175C3D]" : "text-[#C06014]")}
                style={{ fontFamily: "var(--font-body)" }}>
                {product.in_stock
                  ? product.stock_count > 0
                    ? `In stock, ${product.stock_count} available`
                    : "In stock"
                  : "Currently out of stock"}
              </p>
            </div>

            {/* Enquiry-only notice */}
            {product.is_enquiry_only && (
              <div className="mt-4 flex gap-2.5 p-3.5 bg-[#FDF6E7] border border-[#C6A667]/40 rounded-lg">
                <ShieldAlert size={16} className="text-[#C6A667] shrink-0 mt-0.5" />
                <p className="text-[12px] leading-relaxed text-[#6b4a22]" style={{ fontFamily: "var(--font-body)" }}>
                  Product information for this item is pending review and approval. Online checkout is
                  disabled until that is complete — please enquire for details.
                </p>
              </div>
            )}

            {/* What's included */}
            <div className="mt-5 flex items-start gap-2.5 text-[12.5px] text-[#4a5245]"
              style={{ fontFamily: "var(--font-body)" }}>
              <Package size={15} className="text-[#175C3D] shrink-0 mt-0.5" />
              <span>
                {product.includes_balm
                  ? "Supplied with a matching balm container."
                  : "Packaging and contents are confirmed at order."}
              </span>
            </div>

            {/* Quantity + actions */}
            {canBuy ? (
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <div className="flex items-center border border-[#E7E0CF] bg-white rounded-md h-11">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1}
                    aria-label="Decrease quantity"
                    className="w-10 h-full flex items-center justify-center text-[#6b7265] hover:text-[#123D2B] disabled:opacity-40">
                    <Minus size={14} />
                  </button>
                  <span className="w-10 text-center text-[14px] font-medium text-[#252B23]"
                    style={{ fontFamily: "var(--font-body)" }}>{qty}</span>
                  <button onClick={() => setQty((q) => Math.min(product.stock_count, q + 1))}
                    disabled={qty >= product.stock_count} aria-label="Increase quantity"
                    className="w-10 h-full flex items-center justify-center text-[#6b7265] hover:text-[#123D2B] disabled:opacity-40">
                    <Plus size={14} />
                  </button>
                </div>

                <button onClick={() => addItem(product, qty)}
                  className="flex-1 min-w-[180px] h-11 flex items-center justify-center gap-2 bg-[#123D2B] text-white text-[13.5px] font-medium rounded-md hover:bg-[#175C3D] transition-colors active:scale-[0.99]"
                  style={{ fontFamily: "var(--font-body)" }}>
                  <ShoppingCart size={15} /> Add to Cart
                </button>

                <button onClick={() => toggleWishlist(product.id)} aria-label="Add to wishlist" aria-pressed={wished}
                  className="w-11 h-11 flex items-center justify-center border border-[#E7E0CF] bg-white rounded-md hover:border-[#C6A667] transition-colors">
                  <Heart size={16} className={wished ? "fill-[#C06014] text-[#C06014]" : "text-[#6b7265]"} />
                </button>
              </div>
            ) : (
              <div className="mt-6 flex flex-wrap gap-3">
                <a href={enquiryHref} target="_blank" rel="noopener noreferrer"
                  className="flex-1 min-w-[200px] h-11 flex items-center justify-center gap-2 bg-[#123D2B] text-white text-[13.5px] font-medium rounded-md hover:bg-[#175C3D] transition-colors"
                  style={{ fontFamily: "var(--font-body)" }}>
                  <MessageCircle size={15} /> Enquire on WhatsApp
                </a>
                <button onClick={() => toggleWishlist(product.id)} aria-label="Add to wishlist" aria-pressed={wished}
                  className="w-11 h-11 flex items-center justify-center border border-[#E7E0CF] bg-white rounded-md hover:border-[#C6A667] transition-colors">
                  <Heart size={16} className={wished ? "fill-[#C06014] text-[#C06014]" : "text-[#6b7265]"} />
                </button>
              </div>
            )}

            {/* Delivery strip */}
            <div className="mt-5 flex items-center gap-2 text-[12px] text-[#4a5245] p-3 bg-[#FCFAF3] border border-[#EFE9DD] rounded-lg"
              style={{ fontFamily: "var(--font-body)" }}>
              <Truck size={15} className="text-[#175C3D] shrink-0" />
              Delivery fees are calculated at checkout based on your state.
            </div>

            {/* Tabs */}
            <div className="mt-8">
              <div className="flex gap-5 border-b border-[#EFE9DD] overflow-x-auto" role="tablist">
                {TABS.map((t) => (
                  <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
                    className={cn("relative pb-2.5 text-[12.5px] font-medium whitespace-nowrap transition-colors",
                      tab === t ? "text-[#123D2B]" : "text-[#6b7265] hover:text-[#123D2B]")}
                    style={{ fontFamily: "var(--font-body)" }}>
                    {t}
                    {tab === t && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C6A667]" />}
                  </button>
                ))}
              </div>

              <div className="pt-4 text-[13px] leading-relaxed text-[#4a5245]"
                style={{ fontFamily: "var(--font-body)" }} role="tabpanel">
                {tab === "Product Information" && <p>{product.description}</p>}

                {tab === "Ingredients" && (
                  product.ingredients
                    ? <p>{product.ingredients}</p>
                    : <p className="text-[#6b7265] italic">
                        The verified ingredient list for this product has not been supplied yet.
                        It will appear here once confirmed by Wendy Herbals.
                      </p>
                )}

                {tab === "Storage & Safety" && (
                  <div className="space-y-2.5">
                    <p>{product.storage_info ?? "Storage guidance for this product has not been supplied yet."}</p>
                    <p className="text-[#6b7265]">
                      {product.safety_info ??
                        "This product is not intended to diagnose, treat, cure, or prevent any disease. Speak to a qualified healthcare professional about any medical condition, and before combining herbal products with prescribed medicine."}
                    </p>
                  </div>
                )}

                {tab === "Delivery" && (
                  <div className="space-y-2">
                    <p>Orders are confirmed before dispatch. Delivery fees depend on your state and are shown at checkout.</p>
                    <p className="text-[#6b7265]">Tracking status moves through Confirmed, Processing, Dispatched and Delivered.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="text-[1.7rem] text-[#123D2B] font-medium mb-5"
              style={{ fontFamily: "var(--font-heading)" }}>
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
