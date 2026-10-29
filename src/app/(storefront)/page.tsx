import { Hero } from "@/components/home/Hero";
import { CollectionStrip } from "@/components/home/CollectionStrip";
import { FeaturedRow } from "@/components/home/FeaturedRow";
import { BrandStory } from "@/components/home/BrandStory";
import { Newsletter } from "@/components/home/Newsletter";

export default function HomePage() {
  return (
    <>
      <Hero />
      <CollectionStrip />
      <FeaturedRow />
      <BrandStory portraitSrc="/founder/wendy-portrait.jpg" />
      <Newsletter />
    </>
  );
}
