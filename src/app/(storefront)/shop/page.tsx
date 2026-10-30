import { connection } from "next/server";
import { Suspense } from "react";
import type { Metadata } from "next";
import { ShopClient } from "@/components/shop/ShopClient";
import { getCatalogue } from "@/lib/catalogue";

export const metadata: Metadata = {
  title: "Shop",
  description: "Browse Wendy Herbals' botanical collections, natural body care and authentic Nigerian kitchen spices.",
};

export const instant = false;

export default async function ShopPage() {
  const products = await getCatalogue();

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F7F4E9]" />}>
      <ShopClient products={products} />
    </Suspense>
  );
}
