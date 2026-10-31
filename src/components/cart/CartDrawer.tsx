"use client";
import Link from "next/link";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cart";
import { ProductImage } from "@/components/ui/ProductImage";
import { lineTotal, variantLabel } from "@/lib/pricing";
import { FORMAT_NGN } from "@/lib/constants";
import { cn } from "@/lib/cn";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity } = useCartStore();
  const subtotal = useCartStore((s) => s.subtotal());
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeCart(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeCart]);

  if (!mounted) return null;

  return (
    <div className={cn("fixed inset-0 z-[70] transition-opacity duration-300",
      isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")}>
      <div className="absolute inset-0 bg-[#123D2B]/50 backdrop-blur-[2px]" onClick={closeCart} />

      <aside role="dialog" aria-label="Shopping bag" className={cn(
        "absolute top-0 right-0 bottom-0 w-full sm:w-[420px] bg-[#F7F4E9] flex flex-col shadow-2xl transition-transform duration-300 ease-out",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        {/* Head */}
        <div className="flex items-center justify-between px-5 h-[62px] border-b border-[#E7E0CF] shrink-0">
          <h2 className="text-[1.25rem] text-[#123D2B]" style={{ fontFamily: "var(--font-heading)" }}>
            Your Bag {items.length > 0 && <span className="text-[#A8B99C] text-base">({items.length})</span>}
          </h2>
          <button onClick={closeCart} aria-label="Close bag" className="p-2 text-[#252B23] hover:text-[#123D2B]">
            <X size={19} />
          </button>
        </div>

        {/* Items */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 px-8 text-center">
            <ShoppingBag size={38} className="text-[#A8B99C]" strokeWidth={1.3} />
            <p className="text-[#6b7265] text-sm" style={{ fontFamily: "var(--font-body)" }}>
              Your bag is empty.
            </p>
            <Link href="/shop" onClick={closeCart}
              className="mt-1 px-6 py-2.5 bg-[#123D2B] text-white text-[13px] font-medium rounded-md hover:bg-[#175C3D] transition-colors"
              style={{ fontFamily: "var(--font-body)" }}>
              Browse Products
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {items.map((item) => {
                const key = item.size ? `${item.product_id}-${item.size}` : item.product_id;
                return (
                  <div key={key} className="flex gap-3 bg-white rounded-lg border border-[#EFE9DD] p-2.5">
                    <ProductImage src={item.product.images[0]} alt={item.product.name}
                      category={item.product.category} className="w-16 h-16 rounded-md shrink-0" sizes="64px" />

                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] font-medium text-[#252B23] leading-snug line-clamp-2"
                        style={{ fontFamily: "var(--font-body)" }}>{item.product.name}</p>
                      {item.size && (
                        <p className="text-[10.5px] text-[#6b7265] mt-0.5" style={{ fontFamily: "var(--font-body)" }}>
                          Size: {item.size}
                        </p>
                      )}
                      <p className="text-[13px] font-bold text-[#123D2B] mt-1" style={{ fontFamily: "var(--font-body)" }}>
                        {FORMAT_NGN(lineTotal(item))}
                      </p>

                      <div className="flex items-center justify-between mt-1.5">
                        <div className="flex items-center border border-[#EFE9DD] rounded">
                          <button onClick={() => updateQuantity(item.product_id, item.quantity - 1, item.size)}
                            aria-label="Decrease quantity"
                            className="w-6 h-6 flex items-center justify-center text-[#6b7265] hover:text-[#123D2B] disabled:opacity-40"
                            disabled={item.quantity <= 1}>
                            <Minus size={11} />
                          </button>
                          <span className="w-7 text-center text-[12px] font-medium text-[#252B23]"
                            style={{ fontFamily: "var(--font-body)" }}>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product_id, item.quantity + 1, item.size)}
                            aria-label="Increase quantity"
                            className="w-6 h-6 flex items-center justify-center text-[#6b7265] hover:text-[#123D2B] disabled:opacity-40"
                            disabled={item.quantity >= item.product.stock_count}>
                            <Plus size={11} />
                          </button>
                        </div>
                        <button onClick={() => removeItem(item.product_id, item.size)}
                          aria-label={`Remove ${item.product.name}`}
                          className="p-1 text-[#A8B99C] hover:text-[#C06014] transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Foot */}
            <div className="border-t border-[#E7E0CF] px-5 py-4 shrink-0 bg-[#FCFAF3]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[13px] text-[#6b7265]" style={{ fontFamily: "var(--font-body)" }}>Subtotal</span>
                <span className="text-[17px] font-bold text-[#123D2B]" style={{ fontFamily: "var(--font-body)" }}>
                  {FORMAT_NGN(subtotal)}
                </span>
              </div>
              <p className="text-[11px] text-[#6b7265] mb-3" style={{ fontFamily: "var(--font-body)" }}>
                The way bill is confirmed on WhatsApp.
              </p>
              <Link href="/checkout" onClick={closeCart}
                className="w-full h-11 flex items-center justify-center bg-[#123D2B] text-white text-[13.5px] font-medium rounded-md hover:bg-[#175C3D] transition-colors"
                style={{ fontFamily: "var(--font-body)" }}>
                Proceed to Checkout
              </Link>
              <button onClick={closeCart}
                className="w-full h-9 mt-2 text-[12.5px] text-[#6b7265] hover:text-[#123D2B] transition-colors"
                style={{ fontFamily: "var(--font-body)" }}>
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
