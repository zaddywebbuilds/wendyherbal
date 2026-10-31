"use client";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Flower2, User, Leaf, Droplets, UtensilsCrossed } from "lucide-react";
import { CATEGORY_IMAGE } from "@/lib/media";

const CARDS = [
  { id: "womens-wellness", title: "Women's\nWellness", icon: Flower2, grad: "linear-gradient(150deg,#2d5a42 0%,#17402c 100%)" },
  { id: "mens-wellness", title: "Men's\nWellness", icon: User, grad: "linear-gradient(150deg,#1f4b36 0%,#102d20 100%)" },
  { id: "herbal-collections", title: "Herbal\nCollections", icon: Leaf, grad: "linear-gradient(150deg,#355f43 0%,#1a3b28 100%)" },
  { id: "body-care", title: "Natural\nBody Care", icon: Droplets, grad: "linear-gradient(150deg,#8a7a52 0%,#5d4f32 100%)" },
  { id: "food-spices", title: "Food\nSpices", icon: UtensilsCrossed, grad: "linear-gradient(150deg,#9c5f2e 0%,#6b3d18 100%)" },
];

export function CollectionStrip() {
  return (
    <section className="bg-[#FCFAF3] py-10 lg:py-16">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="relative text-center mb-9">
          <h2 className="text-[2rem] lg:text-[2.6rem] text-[#123D2B] font-medium"
            style={{ fontFamily: "var(--font-heading)" }}>
            Shop by Collection
          </h2>
          <p className="mt-1.5 text-[13px] text-[#6b7265]" style={{ fontFamily: "var(--font-body)" }}>
            Explore our carefully curated collections for your everyday wellness and lifestyle.
          </p>
          <Link href="/shop"
            className="lg:absolute lg:right-0 lg:top-1/2 lg:-translate-y-1/2 inline-flex items-center gap-1.5 mt-3 lg:mt-0 text-[12px] font-medium text-[#175C3D] hover:text-[#123D2B] group"
            style={{ fontFamily: "var(--font-body)" }}>
            View All Collections
            <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
          {CARDS.map((c, i) => {
            const Icon = c.icon;
            const img = CATEGORY_IMAGE[c.id];
            return (
              <motion.div key={c.id}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                className={i === 4 ? "col-span-2 md:col-span-1" : ""}
              >
                {/* Photograph on top, words on a plain surface beneath it.
                    Nothing is set over the picture, so no scrim is needed and
                    the heading is black on white rather than white on a
                    gradient that has to be dark enough to carry it. */}
                <Link href={`/shop?category=${c.id}`}
                  className="group block rounded-2xl overflow-hidden bg-white border border-[#EFE9DD] transition-colors hover:border-[#C6A667]">
                  <div className="relative aspect-[3/2] sm:aspect-[4/3] overflow-hidden bg-[#EFE9DD]">
                    <Image src={img.src} alt={img.alt} fill sizes="(max-width:768px) 50vw, 20vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>

                  <div className="p-3.5 lg:p-4">
                    <span className="w-8 h-8 rounded-full bg-[#E8F0EA] flex items-center justify-center mb-2.5">
                      <Icon size={15} className="text-[#175C3D]" strokeWidth={1.7} />
                    </span>
                    <h3 className="text-[#123D2B] text-[16px] lg:text-[18px] leading-[1.15] font-medium whitespace-pre-line"
                      style={{ fontFamily: "var(--font-heading)" }}>
                      {c.title}
                    </h3>
                    <span className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] text-[#175C3D] font-medium"
                      style={{ fontFamily: "var(--font-body)" }}>
                      Shop Collection
                      <ArrowRight size={12} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
