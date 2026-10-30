import { connection } from "next/server";
import { Hero } from "@/components/home/Hero";
import { getFeaturedProducts } from "@/lib/catalogue";
import { CollectionStrip } from "@/components/home/CollectionStrip";
import { FeaturedRow } from "@/components/home/FeaturedRow";
import { BrandStory } from "@/components/home/BrandStory";
import { WorkshopBand } from "@/components/home/WorkshopBand";
import { Newsletter } from "@/components/home/Newsletter";

export const instant = false;

export default async function HomePage() {
  const featured = await getFeaturedProducts(5);

  return (
    <>
      <Hero />
      <CollectionStrip />
      <FeaturedRow products={featured} />
      <BrandStory portraitSrc="/founder/wendy-portrait.jpg" />
      <WorkshopBand />
      <Newsletter />
    </>
  );
}
