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
    <section className="bg-[#FCFAF3] py-14 lg:py-16">
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
                <Link href={`/shop?category=${c.id}`}
                  className="group relative block rounded-lg overflow-hidden aspect-[4/3] lg:aspect-[3/2.4]"
                  style={{ background: c.grad }}>
                  <Image src={img.src} alt={img.alt} fill sizes="(max-width:768px) 50vw, 20vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  {/* scrim: keeps the white heading legible over any photograph */}
                  <div aria-hidden className="absolute inset-0"
                    style={{ background: "linear-gradient(to top, rgba(9,28,19,0.88) 0%, rgba(9,28,19,0.42) 48%, rgba(9,28,19,0.12) 100%)" }} />

                  {/* botanical texture */}
                  <div aria-hidden className="absolute inset-0 opacity-[0.07]">
                    <svg width="100%" height="100%">
                      <defs>
                        <pattern id={`p-${c.id}`} width="54" height="54" patternUnits="userSpaceOnUse" patternTransform="rotate(20)">
                          <path d="M27 9C27 9 17 15 17 26C17 33 21.5 38 27 38C32.5 38 37 33 37 26C37 15 27 9 27 9Z" fill="#fff" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill={`url(#p-${c.id})`} />
                    </svg>
                  </div>

                  {/* hover lift */}
                  <div aria-hidden className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-400" />

                  <div className="relative h-full flex flex-col justify-between p-4">
                    <span className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center transition-transform duration-400 group-hover:scale-110">
                      <Icon size={17} className="text-[#E8DFC4]" strokeWidth={1.6} />
                    </span>

                    <div>
                      <h3 className="text-white text-[17px] lg:text-[19px] leading-[1.15] font-medium whitespace-pre-line"
                        style={{ fontFamily: "var(--font-heading)" }}>
                        {c.title}
                      </h3>
                      <span className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] text-[#E8DFC4] font-medium"
                        style={{ fontFamily: "var(--font-body)" }}>
                        Shop Collection
                        <ArrowRight size={12} className="transition-transform duration-300 group-hover:translate-x-1" />
                      </span>
                    </div>
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
