import { Suspense } from "react";
import type { Metadata } from "next";
import { ShopClient } from "@/components/shop/ShopClient";

export const metadata: Metadata = {
  title: "Shop",
  description: "Browse Wendy Herbals' botanical collections, natural body care and authentic Nigerian kitchen spices.",
};

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F7F4E9]" />}>
      <ShopClient />
    </Suspense>
  );
}
