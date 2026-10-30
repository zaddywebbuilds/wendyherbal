import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero, PageBody, Section, List, Callout, ContactStrip, Related } from "@/components/content/ContentPage";
import { PRODUCTS, CATEGORY_LABELS, getByCategory } from "@/lib/products";
import { BRAND_IMAGES } from "@/lib/media";
import { BRAND_PHRASE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Wendy Herbals brings together herbal preparations, natural body care and authentic Nigerian kitchen spices. Read what we make and how we work.",
  openGraph: {
    title: "About Wendy Herbals",
    description: "What we make, who makes it, and how we talk about our products.",
    images: [{ url: BRAND_IMAGES.measuring.src, alt: BRAND_IMAGES.measuring.alt }],
  },
};

// Counted from the catalogue at build time rather than written in by hand, so
// the figures cannot drift away from what the shop actually lists.
const GALLERY = [
  BRAND_IMAGES.driedHerbs,
  BRAND_IMAGES.herbPowders,
  BRAND_IMAGES.scentLeaf,
  BRAND_IMAGES.productionDrums,
  BRAND_IMAGES.measuring,
  BRAND_IMAGES.spicedDish,
];

const COUNTS = Object.keys(CATEGORY_LABELS).map((key) => ({
  label: CATEGORY_LABELS[key],
  count: getByCategory(key).length,
  href: `/shop?category=${key}`,
}));

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Our Story"
        title="Rooted in Nature. Inspired by Wellness."
        intro="Wendy Herbals brings together time-honoured herbal knowledge and everyday natural products for modern living, from botanical preparations and body care to the kitchen spices that season Nigerian homes."
      />

      <PageBody>
        <Section title="What we make">
          <p>
            Our range covers three kinds of product. Herbal preparations, made to traditional
            formulations and sold by the bottle or as a set with a matching balm. Natural body
            care, including soaps, creams, oils and shea butter. And food spices for the Nigerian
            kitchen, blended for everyday cooking.
          </p>
          <p>
            The shop currently lists {PRODUCTS.length} products across five collections.
          </p>
          <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5 pt-1">
            {COUNTS.map((c) => (
              <li key={c.href}>
                <Link href={c.href}
                  className="flex items-baseline justify-between gap-3 py-2 border-b border-[#123D2B]/8 group">
                  <span className="text-[14px] text-[#252B23] group-hover:text-[#175C3D] transition-colors">
                    {c.label}
                  </span>
                  <span className="text-[12.5px] text-[#6b7265] tabular-nums">{c.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>


        <Section title="In the workshop">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {GALLERY.map((frame) => (
              <figure key={frame.src} className="relative rounded-lg overflow-hidden aspect-[4/5] bg-[#EFE9DD]">
                <Image src={frame.src} alt={frame.alt} fill sizes="(max-width:1024px) 50vw, 30vw"
                  className="object-cover" />
                {frame.caption && (
                  <>
                    <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#09231a]/80 via-transparent to-transparent" />
                    <figcaption className="absolute bottom-0 left-0 right-0 p-3 text-[11px] leading-snug text-white/90">
                      {frame.caption}
                    </figcaption>
                  </>
                )}
              </figure>
            ))}
          </div>
        </Section>
        <Section title="The founder">
          <div className="sm:flex sm:gap-7 sm:items-start">
            <div className="relative w-[128px] h-[128px] shrink-0 mb-5 sm:mb-0">
              <div aria-hidden className="absolute -inset-1.5 rounded-full border border-[#C6A667]/40" />
              <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-[#C6A667]/50 bg-[#EFE9DD]">
                <Image src="/founder/wendy-portrait.jpg" alt="Wendy, founder of Wendy Herbals"
                  fill sizes="128px" className="object-cover object-top" />
              </div>
            </div>
            <div className="space-y-4">
              <p>
                Wendy Herbals is run by its founder, who prepares the range, answers the WhatsApp
                line and packs the orders herself. When you message the number on this site, you
                are messaging her.
              </p>
              <p className="text-[1.2rem] text-[#123D2B] leading-snug" style={{ fontFamily: "var(--font-heading)" }}>
                &ldquo;{BRAND_PHRASE}&rdquo;
              </p>
            </div>
          </div>
        </Section>

        <Section title="How we talk about our products">
          <p>
            Many of our herbal products are named after the concern they are traditionally
            associated with. Those names come from our own price list and from how customers ask
            for them. They are names, not promises.
          </p>
          <List
            items={[
              "We do not claim that any product diagnoses, treats, cures or prevents disease.",
              "We do not publish testimonials, star ratings or before-and-after claims.",
              "We do not display regulatory badges we have not earned.",
              "Where a product has no photograph yet, you will see a placeholder rather than a picture of something else.",
            ]}
          />
          <Callout tone="caution" title="Herbal products are not a substitute for medical care">
            <p>
              Please read our <Link href="/disclaimer" className="underline underline-offset-4">Medical Disclaimer</Link>{" "}
              before buying, and speak to a qualified healthcare professional about any medical
              condition, especially before combining herbal products with prescribed medicine.
            </p>
          </Callout>
        </Section>

        <Section title="How ordering works">
          <p>
            Add what you need to the cart and check out. Payment is by direct bank transfer to the
            account shown at checkout, and you then send the receipt on WhatsApp so the order can
            be confirmed. The way bill is arranged separately. There is no card payment on the
            site and you do not need an account.
          </p>
          <p>
            <Link href="/faq" className="text-[#175C3D] underline underline-offset-4 decoration-[#C6A667]/50">
              Read the full ordering FAQ
            </Link>
          </p>
        </Section>

        <ContactStrip />

        <Related
          links={[
            { label: "Contact", href: "/contact" },
            { label: "Delivery Information", href: "/delivery" },
            { label: "FAQs", href: "/faq" },
            { label: "Medical Disclaimer", href: "/disclaimer" },
          ]}
        />
      </PageBody>
    </>
  );
}
