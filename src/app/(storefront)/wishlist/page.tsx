import { connection } from "next/server";
import type { Metadata } from "next";
import { PageHero } from "@/components/content/ContentPage";
import { WishlistClient } from "@/components/shop/WishlistClient";
import { getCatalogue } from "@/lib/catalogue";

export const metadata: Metadata = {
  title: "Saved Items",
  description: "Products you have saved on this device while you decide.",
  robots: { index: false, follow: true },
};

export const instant = false;

export default async function WishlistPage() {
  await connection();
  const products = await getCatalogue();

  return (
    <>
      <PageHero
        eyebrow="Your list"
        title="Saved items."
        intro="Anything you tap the heart on is kept here. It stays on this device, so there is no account to create and nothing is sent to us."
      />

      <div className="bg-white">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          <WishlistClient products={products} />
        </div>
      </div>
    </>
  );
}
