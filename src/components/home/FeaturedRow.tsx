"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { getFeatured } from "@/lib/products";

const BADGES: Record<number, "New" | "Bestseller" | null> = {
  0: "New", 1: "Bestseller", 2: "New", 3: "Bestseller", 4: null,
};

export function FeaturedRow() {
  const products = getFeatured(5);

  return (
    <section className="bg-[#F7F4E9] py-14 lg:py-16">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_440px] gap-6 lg:gap-7">

          {/* ---------- Featured products ---------- */}
          <div>
            <div className="flex items-end justify-between mb-5">
              <div>
                <h2 className="text-[1.9rem] lg:text-[2.3rem] text-[#123D2B] font-medium leading-tight"
                  style={{ fontFamily: "var(--font-heading)" }}>
                  Discover Wendy&rsquo;s Selection
                </h2>
                <p className="text-[12.5px] text-[#6b7265] mt-0.5" style={{ fontFamily: "var(--font-body)" }}>
                  Popular products from our herbal and spice collections.
                </p>
              </div>
              <Link href="/shop"
                className="hidden sm:inline-flex items-center gap-1.5 text-[12px] font-medium text-[#175C3D] hover:text-[#123D2B] group shrink-0 pb-1"
                style={{ fontFamily: "var(--font-body)" }}>
                View All Products
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {products.map((p, i) => (
                <motion.div key={p.id}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  className={i === 4 ? "hidden xl:block" : ""}
                >
                  <ProductCard product={p} badge={BADGES[i]} />
                </motion.div>
              ))}
            </div>

            <Link href="/shop"
              className="sm:hidden mt-4 w-full h-10 flex items-center justify-center gap-1.5 border border-[#123D2B]/30 text-[#123D2B] text-[13px] font-medium rounded-md"
              style={{ fontFamily: "var(--font-body)" }}>
              View All Products <ArrowRight size={14} />
            </Link>
          </div>

          {/* ---------- Spice feature ---------- */}
          <motion.div
            initial={{ opacity: 0, x: 26 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-xl overflow-hidden min-h-[340px] lg:min-h-full flex flex-col justify-center p-7 lg:p-8"
            style={{ background: "linear-gradient(145deg,#F6E4CA 0%,#EBCFA6 48%,#D9B478 100%)" }}
          >
            {/* spice texture */}
            <div aria-hidden className="absolute inset-0 opacity-[0.16]">
              <svg width="100%" height="100%">
                <defs>
                  <pattern id="spiceDots" width="34" height="34" patternUnits="userSpaceOnUse" patternTransform="rotate(28)">
                    <circle cx="7" cy="7" r="2.4" fill="#8B4513" />
                    <circle cx="23" cy="17" r="1.7" fill="#B5713A" />
                    <circle cx="13" cy="27" r="2" fill="#C06014" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#spiceDots)" />
              </svg>
            </div>
            <div aria-hidden className="absolute -right-14 -bottom-14 w-56 h-56 rounded-full bg-[#C06014]/18 blur-3xl" />

            <div className="relative">
              <p className="text-[10.5px] font-semibold tracking-[0.2em] uppercase text-[#8B4513] mb-3"
                style={{ fontFamily: "var(--font-body)" }}>
                Natural Food Spices
              </p>
              <h2 className="text-[2rem] lg:text-[2.4rem] leading-[1.1] text-[#5A3610] font-medium"
                style={{ fontFamily: "var(--font-heading)" }}>
                Bring Natural
                <br />Flavour to Every Meal.
              </h2>
              <p className="mt-3.5 text-[13px] leading-relaxed text-[#6b4a22] max-w-xs"
                style={{ fontFamily: "var(--font-body)" }}>
                Explore Wendy Herbals&rsquo; collection of authentic kitchen spices
                and seasonings for delicious, home-cooked meals.
              </p>

              <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-1.5 max-w-sm">
                {["Banga (Ofe Akwu)", "Ginger", "Turmeric", "Garlic", "Black Pepper", "Jollof Rice"].map((s) => (
                  <li key={s} className="text-[11px] text-[#6b4a22] flex items-center gap-1"
                    style={{ fontFamily: "var(--font-body)" }}>
                    <span className="w-1 h-1 rounded-full bg-[#C06014]" />{s}
                  </li>
                ))}
              </ul>

              <Link href="/shop?category=food-spices"
                className="group mt-6 inline-flex items-center gap-2 px-6 py-3 bg-[#5A3610] text-white text-[13px] font-medium rounded-md hover:bg-[#45280B] transition-all active:scale-[0.98]"
                style={{ fontFamily: "var(--font-body)" }}>
                Shop All Spices
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
