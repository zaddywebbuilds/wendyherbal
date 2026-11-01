"use client";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Leaf, HeartPulse, Users, Sprout } from "lucide-react";
import { BRAND_PHRASE } from "@/lib/constants";

const VALUES = [
  { icon: Leaf, title: "Natural Herbs", sub: "Real Benefits" },
  { icon: HeartPulse, title: "Healthy Living", sub: "For Generations" },
  { icon: Users, title: "People", sub: "At Our Core" },
  { icon: Sprout, title: "A Healthier", sub: "Tomorrow" },
];

interface Props {
  /** Founder portrait path under /public. Supplied by the client; omitted renders a neutral frame. */
  portraitSrc?: string;
}

export function BrandStory({ portraitSrc }: Props) {
  return (
    <section className="relative overflow-hidden bg-[#123D2B] py-8 lg:py-12">
      {/* Plain surface: no pattern, no glows. */}

      <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1.1fr_auto_1fr] gap-9 lg:gap-10 items-center">

          {/* ---------- Copy ---------- */}
          <motion.div
            initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-[10.5px] font-semibold tracking-[0.22em] uppercase text-[#C6A667] mb-3"
              style={{ fontFamily: "var(--font-body)" }}>
              A Healthier Tomorrow
            </p>
            <h2 className="text-[2rem] lg:text-[2.7rem] leading-[1.1] text-white font-medium"
              style={{ fontFamily: "var(--font-heading)" }}>
              Nature Has Always
              <br />Been Part of Our Story.
            </h2>
            <span className="block w-14 h-px bg-[#C6A667] my-4" />
            <p className="text-[13.5px] leading-relaxed text-white/75 max-w-md"
              style={{ fontFamily: "var(--font-body)" }}>
              Wendy Herbals brings together time-honoured herbal knowledge and everyday
              natural products for modern living, from botanical preparations and body
              care to the kitchen spices that season Nigerian homes.
            </p>

            <Link href="/about"
              className="group mt-6 inline-flex items-center gap-2 px-6 py-3 border border-[#C6A667]/60 text-[#C6A667] text-[13px] font-medium rounded-md hover:bg-[#C6A667] hover:text-[#123D2B] transition-all active:scale-[0.98]"
              style={{ fontFamily: "var(--font-body)" }}>
              Our Story
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>

          {/* ---------- Founder ---------- */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }} whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center text-center mx-auto"
          >
            <div className="relative w-[170px] h-[170px] lg:w-[196px] lg:h-[196px]">
              <div aria-hidden className="absolute -inset-2 rounded-full border border-[#C6A667]/30" />
              <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-[#C6A667]/50 bg-[#1a4d36]">
                {portraitSrc ? (
                  <Image src={portraitSrc} alt="Wendy, founder of Wendy Herbals" fill sizes="196px"
                    className="object-cover object-top" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 px-4">
                    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" className="opacity-45">
                      <circle cx="12" cy="8" r="4" stroke="#C6A667" strokeWidth="1.3" />
                      <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="#C6A667" strokeWidth="1.3" strokeLinecap="round" />
                    </svg>
                    <span className="text-[9px] uppercase tracking-widest text-[#C6A667]/70 leading-tight"
                      style={{ fontFamily: "var(--font-body)" }}>
                      Portrait<br />pending
                    </span>
                  </div>
                )}
              </div>
            </div>

            <p className="mt-5 text-[1.45rem] lg:text-[1.7rem] text-white leading-tight"
              style={{ fontFamily: "var(--font-heading)" }}>
              We Treat,<br />God Heals.
            </p>
            <p className="mt-1.5 text-[11px] text-[#C6A667]" style={{ fontFamily: "var(--font-body)" }}>
              &mdash; Founder, Wendy Herbals
            </p>
            <p className="sr-only">{BRAND_PHRASE}</p>
          </motion.div>

          {/* ---------- Values ---------- */}
          <div className="grid grid-cols-2 gap-x-5 gap-y-7">
            {VALUES.map(({ icon: Icon, title, sub }, i) => (
              <motion.div key={title}
                initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: 0.15 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-center text-center"
              >
                <span className="w-11 h-11 rounded-full border border-[#C6A667]/35 flex items-center justify-center mb-2.5">
                  <Icon size={18} className="text-[#C6A667]" strokeWidth={1.5} />
                </span>
                <p className="text-[12.5px] font-semibold text-white leading-tight"
                  style={{ fontFamily: "var(--font-body)" }}>{title}</p>
                <p className="text-[11px] text-white/55 leading-tight"
                  style={{ fontFamily: "var(--font-body)" }}>{sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
