"use client";
import Link from "next/link";
import { Info, AlertTriangle, HelpCircle, ArrowRight } from "lucide-react";
import type { BlogSection } from "@/data/blog-posts";

const CALLOUT_TONES = {
  note: { bg: "#F7F4E9", border: "#A8B99C", Icon: Info, iconColor: "#175C3D" },
  pending: { bg: "#FBF6EA", border: "#C6A667", Icon: HelpCircle, iconColor: "#8a6d2f" },
  caution: { bg: "#FDF3EE", border: "#C06014", Icon: AlertTriangle, iconColor: "#A8450B" },
} as const;

export function RenderSection({ section }: { section: BlogSection }) {
  const bodyFont = { fontFamily: "var(--font-body)" };
  const headFont = { fontFamily: "var(--font-heading)" };

  switch (section.type) {
    case "h2":
      return (
        <h2 className="text-[1.35rem] lg:text-[1.6rem] text-[#123D2B] leading-tight mt-8 mb-3"
          style={headFont}>
          {section.content}
        </h2>
      );

    case "h3":
      return (
        <h3 className="text-[1.1rem] lg:text-[1.2rem] font-semibold text-[#252B23] mt-5 mb-2"
          style={bodyFont}>
          {section.content}
        </h3>
      );

    case "p":
      return (
        <p className="text-[14.5px] leading-relaxed text-[#4a5247]" style={bodyFont}>
          {section.content}
        </p>
      );

    case "list":
      return (
        <ul className="space-y-2.5 my-2" style={bodyFont}>
          {(section.items ?? []).map((item, i) => (
            <li key={i} className="flex gap-3 text-[14.5px] leading-relaxed text-[#4a5247]">
              <span aria-hidden className="mt-[9px] w-1.5 h-1.5 rounded-full bg-[#C6A667] shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );

    case "callout": {
      const tone = section.tone ?? "note";
      const { bg, border, Icon, iconColor } = CALLOUT_TONES[tone];
      return (
        <div className="rounded-xl border-l-[3px] p-4 sm:p-5 my-4"
          style={{ background: bg, borderLeftColor: border }}>
          <div className="flex gap-3">
            <Icon size={17} className="shrink-0 mt-[2px]" style={{ color: iconColor }} strokeWidth={1.8} />
            <div className="space-y-1.5 text-[13.5px] leading-relaxed text-[#4a5247]" style={bodyFont}>
              {section.title && (
                <p className="font-semibold text-[#252B23]">{section.title}</p>
              )}
              <p>{section.content}</p>
            </div>
          </div>
        </div>
      );
    }

    case "cta":
      return (
        <div className="rounded-2xl bg-[#123D2B] text-white p-5 sm:p-6 my-6">
          {section.title && (
            <p className="text-[13px] font-semibold tracking-[0.14em] uppercase text-[#C6A667] mb-2"
              style={bodyFont}>
              {section.title}
            </p>
          )}
          {section.content && (
            <p className="text-[14px] text-white/80 leading-relaxed mb-4" style={bodyFont}>
              {section.content}
            </p>
          )}
          {section.href && section.ctaLabel && (
            <Link href={section.href}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#C6A667] text-[#123D2B] text-[13px] font-semibold hover:bg-[#d4b77c] transition-colors"
              style={bodyFont}>
              {section.ctaLabel}
              <ArrowRight size={14} />
            </Link>
          )}
        </div>
      );

    default:
      return null;
  }
}
