import { connection } from "next/server";
import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { getFeaturedProducts } from "@/lib/catalogue";
import { CollectionStrip } from "@/components/home/CollectionStrip";
import { FeaturedRow } from "@/components/home/FeaturedRow";
import { BrandStory } from "@/components/home/BrandStory";
import { WorkshopBand } from "@/components/home/WorkshopBand";
import { Newsletter } from "@/components/home/Newsletter";
import { SITE_NAME, WHATSAPP_NUMBER, FACEBOOK_URL } from "@/lib/constants";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export const instant = false;

/**
 * Organisation markup, asserting only what can be checked.
 *
 * No aggregateRating, no review count, no awards and no founding date: there
 * are no reviews to count and no date on record, and inventing either is the
 * sort of thing that gets structured data ignored at best.
 */
const ORGANISATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: process.env.NEXT_PUBLIC_SITE_URL ?? undefined,
  logo: process.env.NEXT_PUBLIC_SITE_URL
    ? `${process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")}/founder/wendy-portrait.jpg`
    : undefined,
  telephone: WHATSAPP_NUMBER,
  sameAs: [FACEBOOK_URL],
  areaServed: { "@type": "Country", name: "Nigeria" },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: WHATSAPP_NUMBER,
    contactType: "customer service",
    availableLanguage: "English",
  },
};

export default async function HomePage() {
  await connection();
  const featured = await getFeaturedProducts(5);

  return (
    <>
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANISATION_SCHEMA) }} />
      <Hero />
      <CollectionStrip />
      <FeaturedRow products={featured} />
      <BrandStory portraitSrc="/founder/wendy-portrait.jpg" />
      <WorkshopBand />
      <Newsletter />
    </>
  );
}
