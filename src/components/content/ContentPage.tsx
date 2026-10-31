import Link from "next/link";
import { MessageCircle, Facebook, Info, AlertTriangle, HelpCircle } from "lucide-react";
import { cn } from "@/lib/cn";
import { WHATSAPP_URL, WHATSAPP_NUMBER, FACEBOOK_URL } from "@/lib/constants";

/**
 * Shared furniture for the written pages (About, Contact, FAQ, the policies).
 *
 * These are introduced as primitives rather than inlined because all eight
 * pages use them; a one-off page should still follow the inline Tailwind
 * convention used elsewhere in the storefront.
 */

export function PageHero({ eyebrow, title, intro }: { eyebrow: string; title: string; intro?: string }) {
  return (
    <section className="bg-[#F7F4E9] border-b border-[#123D2B]/8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-24">
        <p className="text-[10.5px] font-semibold tracking-[0.22em] uppercase text-[#175C3D] mb-3"
          style={{ fontFamily: "var(--font-body)" }}>
          {eyebrow}
        </p>
        <h1 className="text-[2.1rem] lg:text-[3rem] leading-[1.08] text-[#123D2B] font-medium"
          style={{ fontFamily: "var(--font-heading)" }}>
          {title}
        </h1>
        <span className="block w-14 h-px bg-[#C6A667] mt-5" />
        {intro && (
          <p className="mt-5 text-[14.5px] leading-relaxed text-[#4a5247] max-w-2xl"
            style={{ fontFamily: "var(--font-body)" }}>
            {intro}
          </p>
        )}
      </div>
    </section>
  );
}

export function PageBody({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-24 space-y-12">
        {children}
      </div>
    </div>
  );
}

export function Section({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section>
      {title && (
        <h2 className="text-[1.45rem] lg:text-[1.7rem] text-[#123D2B] leading-tight mb-4"
          style={{ fontFamily: "var(--font-heading)" }}>
          {title}
        </h2>
      )}
      <div className="space-y-4 text-[14.5px] leading-relaxed text-[#4a5247]"
        style={{ fontFamily: "var(--font-body)" }}>
        {children}
      </div>
    </section>
  );
}

/** Bulleted list with the house leaf marker. */
export function List({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span aria-hidden className="mt-[9px] w-1.5 h-1.5 rounded-full bg-[#C6A667] shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

const TONES = {
  note: { bg: "#F7F4E9", border: "#A8B99C", icon: Info, iconColor: "#175C3D" },
  pending: { bg: "#FBF6EA", border: "#C6A667", icon: HelpCircle, iconColor: "#8a6d2f" },
  caution: { bg: "#FDF3EE", border: "#C06014", icon: AlertTriangle, iconColor: "#A8450B" },
} as const;

/**
 * `pending` is used where a policy genuinely has not been settled with the
 * owner yet. Saying so plainly beats inventing a figure the business has never
 * agreed to; see Principle 1 in HANDOFF.md.
 */
export function Callout({
  tone = "note",
  title,
  children,
}: {
  tone?: keyof typeof TONES;
  title?: string;
  children: React.ReactNode;
}) {
  const t = TONES[tone];
  const Icon = t.icon;
  return (
    <div className="rounded-xl border-l-[3px] p-4 sm:p-5"
      style={{ background: t.bg, borderLeftColor: t.border }}>
      <div className="flex gap-3">
        <Icon size={17} className="shrink-0 mt-[2px]" style={{ color: t.iconColor }} strokeWidth={1.8} />
        <div className="space-y-2 text-[13.5px] leading-relaxed text-[#4a5247]"
          style={{ fontFamily: "var(--font-body)" }}>
          {title && (
            <p className="font-semibold text-[#252B23]">{title}</p>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}

export function EffectiveDate({ date }: { date: string }) {
  return (
    <p className="text-[12.5px] text-[#6b7265]" style={{ fontFamily: "var(--font-body)" }}>
      Last updated {date}.
    </p>
  );
}

/** WhatsApp-first contact block. The shop genuinely runs on WhatsApp. */
export function ContactStrip({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl bg-[#123D2B] text-white p-6 sm:p-8", className)}>
      <h2 className="text-[1.4rem] leading-tight" style={{ fontFamily: "var(--font-heading)" }}>
        Questions? Message Wendy Herbals.
      </h2>
      <p className="mt-2 text-[13.5px] text-white/70 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
        Orders, product questions and delivery are all arranged on WhatsApp.
      </p>
      <div className="flex flex-wrap gap-3 mt-5">
        <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#C6A667] text-[#123D2B] text-[13px] font-semibold hover:bg-[#d4b77c] transition-colors active:scale-[0.98]"
          style={{ fontFamily: "var(--font-body)" }}>
          <MessageCircle size={15} />
          {WHATSAPP_NUMBER}
        </a>
        <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-white/25 text-white text-[13px] font-medium hover:border-[#C6A667] hover:text-[#C6A667] transition-colors"
          style={{ fontFamily: "var(--font-body)" }}>
          <Facebook size={15} />
          Facebook
        </a>
      </div>
    </div>
  );
}

export function Related({ links }: { links: { label: string; href: string }[] }) {
  return (
    <nav className="border-t border-[#123D2B]/10 pt-6">
      <p className="text-[10.5px] font-semibold tracking-[0.2em] uppercase text-[#6b7265] mb-3"
        style={{ fontFamily: "var(--font-body)" }}>
        Related
      </p>
      <ul className="flex flex-wrap gap-x-6 gap-y-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href}
              className="text-[13.5px] text-[#175C3D] underline underline-offset-4 decoration-[#C6A667]/50 hover:decoration-[#C6A667] transition-colors"
              style={{ fontFamily: "var(--font-body)" }}>
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
