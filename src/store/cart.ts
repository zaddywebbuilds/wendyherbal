"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product } from "@/lib/types";
import { lineTotal } from "@/lib/pricing";

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, quantity?: number, size?: string) => void;
  removeItem: (productId: string, size?: string) => void;
  updateQuantity: (productId: string, quantity: number, size?: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  itemCount: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      /**
       * stock_count 0 means "not counted yet", not "none left", so it must
       * never cap a quantity. Clamping to it was silently setting the
       * quantity to zero the second time anything was added to the bag.
       */
      addItem: (product, quantity = 1, size) => {
        set((state) => {
          const key = size ? `${product.id}-${size}` : product.id;
          const existing = state.items.find(
            (i) => (size ? `${i.product_id}-${i.size}` : i.product_id) === key
          );
          if (existing) {
            return {
              items: state.items.map((i) => {
                const iKey = size ? `${i.product_id}-${i.size}` : i.product_id;
                return iKey === key
                  ? { ...i, quantity: i.product.stock_count > 0
                      ? Math.min(i.quantity + quantity, i.product.stock_count)
                      : i.quantity + quantity }
                  : i;
              }),
              isOpen: true,
            };
          }
          return {
            items: [...state.items, { product_id: product.id, product, quantity, size }],
            isOpen: true,
          };
        });
      },

      removeItem: (productId, size) => {
        set((state) => ({
          items: state.items.filter((i) => {
            if (size) return !(i.product_id === productId && i.size === size);
            return i.product_id !== productId;
          }),
        }));
      },

      updateQuantity: (productId, quantity, size) => {
        if (quantity < 1) {
          get().removeItem(productId, size);
          return;
        }
        set((state) => ({
          items: state.items.map((i) => {
            if (size) {
              return i.product_id === productId && i.size === size
                ? { ...i, quantity: (i.product.stock_count > 0 ? Math.min(quantity, i.product.stock_count) : quantity) }
                : i;
            }
            return i.product_id === productId
              ? { ...i, quantity: (i.product.stock_count > 0 ? Math.min(quantity, i.product.stock_count) : quantity) }
              : i;
          }),
        }));
      },

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: () => get().items.reduce((sum, i) => sum + lineTotal(i), 0),
    }),
    { name: "wendy-herbals-cart" }
  )
);
