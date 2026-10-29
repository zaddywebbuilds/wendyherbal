"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play, Leaf, Award, ShieldCheck, Truck, HeartHandshake } from "lucide-react";

const TRUST = [
  { icon: Leaf, title: "100%", sub: "Ingredients" },
  { icon: Award, title: "Premium", sub: "Quality" },
  { icon: ShieldCheck, title: "Safe &", sub: "Trusted" },
  { icon: Truck, title: "Nationwide", sub: "Delivery" },
  { icon: HeartHandshake, title: "Wellness", sub: "For Everyone" },
];

const fade = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#F7F4E9] via-[#F2EDDE] to-[#E8E2CE]">
      {/* Botanical texture */}
      <div aria-hidden className="absolute inset-0 opacity-[0.07] pointer-events-none">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="leafPattern" width="120" height="120" patternUnits="userSpaceOnUse" patternTransform="rotate(12)">
              <path d="M60 20C60 20 40 32 40 54C40 68 49 78 60 78C71 78 80 68 80 54C80 32 60 20 60 20Z" fill="#123D2B" />
              <line x1="60" y1="24" x2="60" y2="76" stroke="#123D2B" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#leafPattern)" />
        </svg>
      </div>

      {/* Soft greenery glows */}
      <div aria-hidden className="absolute -left-32 top-10 w-96 h-96 rounded-full bg-[#A8B99C]/25 blur-[90px] pointer-events-none" />
      <div aria-hidden className="absolute -right-20 bottom-0 w-[420px] h-[420px] rounded-full bg-[#C6A667]/15 blur-[100px] pointer-events-none" />

      <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1fr_1.05fr] gap-10 lg:gap-12 items-center py-14 lg:py-20">
          {/* ---------- Left: copy ---------- */}
          <div className="max-w-xl">
            <motion.p custom={0} variants={fade} initial="hidden" animate="show"
              className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[#175C3D] mb-4 flex items-center gap-2"
              style={{ fontFamily: "var(--font-body)" }}>
              Natural Wellness &amp; Everyday Essentials
              <span className="h-px w-8 bg-[#C6A667]" />
            </motion.p>

            <motion.h1 custom={1} variants={fade} initial="hidden" animate="show"
              className="text-[2.6rem] sm:text-6xl lg:text-[4.1rem] leading-[1.04] text-[#123D2B] font-medium"
              style={{ fontFamily: "var(--font-heading)" }}>
              Nature&rsquo;s Goodness,
              <br />
              Beautifully <span className="text-[#C6A667] italic">Delivered.</span>
            </motion.h1>

            <motion.p custom={2} variants={fade} initial="hidden" animate="show"
              className="mt-5 text-[15px] leading-relaxed text-[#4a5245] max-w-lg"
              style={{ fontFamily: "var(--font-body)" }}>
              Explore thoughtfully presented herbal collections, natural body care essentials,
              and authentic kitchen spices from Wendy Herbals.
            </motion.p>

            <motion.div custom={3} variants={fade} initial="hidden" animate="show"
              className="mt-8 flex flex-wrap gap-3">
              <Link href="/shop"
                className="group inline-flex items-center gap-2 px-7 py-3.5 bg-[#123D2B] text-white text-sm font-medium rounded-md hover:bg-[#175C3D] transition-all active:scale-[0.98]"
                style={{ fontFamily: "var(--font-body)" }}>
                Explore Collections
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/shop?category=food-spices"
                className="group inline-flex items-center gap-2 px-7 py-3.5 border border-[#123D2B]/30 text-[#123D2B] text-sm font-medium rounded-md hover:border-[#123D2B] hover:bg-[#123D2B]/5 transition-all active:scale-[0.98]"
                style={{ fontFamily: "var(--font-body)" }}>
                <span className="w-6 h-6 rounded-full bg-[#C6A667] flex items-center justify-center">
                  <Play size={10} className="text-white fill-white ml-0.5" />
                </span>
                Shop Food Spices
              </Link>
            </motion.div>

            {/* Trust row */}
            <motion.div custom={4} variants={fade} initial="hidden" animate="show"
              className="mt-10 grid grid-cols-3 sm:grid-cols-5 gap-x-3 gap-y-5 max-w-lg">
              {TRUST.map(({ icon: Icon, title, sub }) => (
                <div key={title} className="flex items-center gap-2">
                  <Icon size={17} className="text-[#175C3D] shrink-0" strokeWidth={1.6} />
                  <div className="leading-tight" style={{ fontFamily: "var(--font-body)" }}>
                    <p className="text-[11px] font-semibold text-[#123D2B]">{title}</p>
                    <p className="text-[10px] text-[#6b7265]">{sub}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ---------- Right: product showcase ---------- */}
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative">
            <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-[#EFE9DD] to-[#DDD4BC] aspect-[4/3] shadow-[0_18px_60px_-20px_rgba(18,61,43,0.35)]">
              {/* Placeholder composition until Wendy's product photography is imported */}
              <div className="absolute inset-0 flex items-end justify-center gap-3 sm:gap-5 px-6 pb-10">
                {[
                  { h: "58%", w: "15%", label: "Ginger" },
                  { h: "66%", w: "15%", label: "Pepper" },
                  { h: "84%", w: "19%", label: "Liquid Herbs" },
                  { h: "54%", w: "17%", label: "Soap" },
                  { h: "46%", w: "15%", label: "Cream" },
                ].map((b, i) => (
                  <motion.div key={b.label}
                    initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.35 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                    className="relative rounded-t-md rounded-b-sm flex flex-col items-center justify-end pb-2"
                    style={{
                      height: b.h, width: b.w,
                      background: "linear-gradient(170deg,#1d5338 0%,#123D2B 55%,#0d2d20 100%)",
                      boxShadow: "0 10px 26px -8px rgba(18,61,43,0.5)",
                    }}>
                    {/* cap */}
                    <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-[68%] h-2.5 rounded-sm bg-[#C6A667]" />
                    {/* label band */}
                    <span className="absolute top-[22%] left-[8%] right-[8%] h-[46%] rounded-[3px] bg-[#F7F4E9]/92 flex flex-col items-center justify-center gap-1 px-1">
                      <svg width="13" height="15" viewBox="0 0 32 36" className="shrink-0">
                        <path d="M16 4C16 4 5 11 5 23C5 30.2 9.9 36 16 36C22.1 36 27 30.2 27 23C27 11 16 4 16 4Z" fill="#175C3D" opacity="0.85" />
                      </svg>
                      <span className="text-[6px] sm:text-[7px] font-bold tracking-tight text-[#123D2B] text-center leading-none"
                        style={{ fontFamily: "var(--font-body)" }}>
                        WENDY<br />HERBALS
                      </span>
                      <span className="text-[5px] sm:text-[6px] text-[#6b7265] text-center leading-none truncate w-full"
                        style={{ fontFamily: "var(--font-body)" }}>
                        {b.label}
                      </span>
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* mortar + botanical hint */}
              <div aria-hidden className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#C9BFA3]/70 to-transparent" />

              <p className="absolute bottom-2.5 left-0 right-0 text-center text-[9px] uppercase tracking-[0.18em] text-[#6b7265]"
                style={{ fontFamily: "var(--font-body)" }}>
                Product photography pending import
              </p>
            </div>

            {/* Gold seal */}
            <motion.div initial={{ opacity: 0, rotate: -25, scale: 0.7 }} animate={{ opacity: 1, rotate: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.85, ease: [0.22, 1, 0.36, 1] }}
              className="absolute -top-4 -right-2 sm:top-5 sm:right-5 w-[92px] h-[92px] sm:w-[108px] sm:h-[108px] rounded-full bg-[#F7F4E9] border border-[#C6A667]/60 flex flex-col items-center justify-center text-center shadow-[0_8px_28px_-8px_rgba(198,166,103,0.6)]">
              <span className="text-[#C6A667] text-[13px] sm:text-[15px] italic leading-[1.15]"
                style={{ fontFamily: "var(--font-heading)" }}>
                Herbal<br />Goodness
              </span>
              <span className="w-7 h-px bg-[#C6A667]/50 my-1" />
              <span className="text-[8px] uppercase tracking-[0.14em] text-[#175C3D]"
                style={{ fontFamily: "var(--font-body)" }}>
                Naturally Made
              </span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
