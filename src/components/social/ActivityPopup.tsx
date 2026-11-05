"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { X, Quote, MapPin } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * The card that slides in bottom-left.
 *
 * Two kinds, interleaved: a real recent order ("Someone in Lagos ordered
 * Ginger Powder") and a customer testimonial Wendy has published. Both come
 * from real records. Buyers are never named, because an order says something
 * about a person's health that a shop has no business broadcasting.
 *
 * With nothing to show it renders nothing at all.
 */

interface OrderCard {
  kind: "order";
  id: string;
  place: string;
  product: string;
  slug: string;
  at: string;
  exactTime: boolean;
}

interface QuoteCard {
  kind: "quote";
  id: string;
  name: string;
  text: string;
  product: string;
  slug: string;
  date: string | null;
}

type Card = OrderCard | QuoteCard;

const FIRST_DELAY = 6000;
const VISIBLE_MS = 8000;
const GAP_MS = 6000;
const DISMISS_KEY = "wh-activity-popup-dismissed";

/** Pages where a floating card is in the way rather than useful. */
const HIDDEN_ON = ["/checkout", "/admin", "/wishlist"];

/** Coarse on purpose: the sheet stores minutes, not seconds. */
function relativeTime(iso: string, exact: boolean): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (!exact) {
    // Older rows carry a date with no clock, so they would all claim midnight.
    const days = Math.floor(mins / 1440);
    if (days <= 0) return "today";
    if (days === 1) return "yesterday";
    return `${days} days ago`;
  }
  if (mins < 2) return "just now";
  if (mins < 60) return `${mins} minutes ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}

/** Alternates order, quote, order, quote so neither kind dominates. */
function interleave(orders: OrderCard[], quotes: QuoteCard[]): Card[] {
  const out: Card[] = [];
  for (let i = 0; i < Math.max(orders.length, quotes.length); i++) {
    if (orders[i]) out.push(orders[i]);
    if (quotes[i]) out.push(quotes[i]);
  }
  return out;
}

export function ActivityPopup() {
  const pathname = usePathname();
  const [cards, setCards] = useState<Card[]>([]);
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(false);
  const [dismissed, setDismissed] = useState(true); // assume so until checked
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const hiddenHere = HIDDEN_ON.some((p) => pathname.startsWith(p));

  // sessionStorage throws in some private modes, and a social proof card is
  // never worth breaking a page over.
  useEffect(() => {
    try {
      setDismissed(sessionStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  useEffect(() => {
    if (dismissed || hiddenHere) return;
    let cancelled = false;

    Promise.all([
      fetch("/api/activity/recent").then((r) => (r.ok ? r.json() : { items: [] })).catch(() => ({ items: [] })),
      fetch("/api/testimonials/popup").then((r) => (r.ok ? r.json() : { items: [] })).catch(() => ({ items: [] })),
    ]).then(([a, t]) => {
      if (cancelled) return;
      const orders: OrderCard[] = (a.items ?? []).map((o: Omit<OrderCard, "kind">) => ({ ...o, kind: "order" as const }));
      const quotes: QuoteCard[] = (t.items ?? []).map((q: Omit<QuoteCard, "kind">) => ({ ...q, kind: "quote" as const }));
      setCards(interleave(orders, quotes));
    });

    return () => { cancelled = true; };
  }, [dismissed, hiddenHere]);

  useEffect(() => {
    if (dismissed || hiddenHere || cards.length === 0) return;

    const slow = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const visible = slow ? VISIBLE_MS * 2 : VISIBLE_MS;

    const cycle = (delay: number) => {
      timers.current.push(setTimeout(() => {
        setShown(true);
        timers.current.push(setTimeout(() => {
          setShown(false);
          timers.current.push(setTimeout(() => {
            setIndex((i) => (i + 1) % cards.length);
            cycle(GAP_MS);
          }, 600));
        }, visible));
      }, delay));
    };

    cycle(FIRST_DELAY);
    return () => { timers.current.forEach(clearTimeout); timers.current = []; };
  }, [cards, dismissed, hiddenHere]);

  function dismiss() {
    setShown(false);
    setDismissed(true);
    try { sessionStorage.setItem(DISMISS_KEY, "1"); } catch { /* fine */ }
  }

  if (dismissed || hiddenHere || cards.length === 0) return null;
  const card = cards[index];
  if (!card) return null;

  return (
    <div
      aria-live="polite"
      className={cn(
        "fixed z-40 left-3 right-3 bottom-3 sm:right-auto sm:w-[320px]",
        "transition-all duration-500 ease-out motion-reduce:transition-none",
        shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
      )}
    >
      <div className="relative rounded-xl bg-white border border-[#E7E0CF] shadow-[0_10px_34px_-12px_rgba(18,61,43,0.3)] p-3.5 pr-9">
        <button
          onClick={dismiss}
          aria-label="Hide these notes"
          className="absolute top-2.5 right-2.5 p-1 text-[#A8B99C] hover:text-[#123D2B] transition-colors"
        >
          <X size={14} />
        </button>

        {card.kind === "order" ? (
          <div className="flex gap-2.5">
            <span aria-hidden
              className="w-9 h-9 rounded-lg bg-[#E8F0EA] flex items-center justify-center shrink-0">
              <MapPin size={16} className="text-[#175C3D]" strokeWidth={1.9} />
            </span>
            <div className="min-w-0" style={{ fontFamily: "var(--font-body)" }}>
              <p className="text-[12.5px] text-[#4a5247]">
                Someone in <span className="font-semibold text-[#123D2B]">{card.place}</span>
              </p>
              <p className="text-[12.5px] text-[#4a5247] leading-snug">
                ordered{" "}
                <Link href={`/product/${card.slug}`}
                  className="font-medium text-[#175C3D] hover:underline">
                  {card.product}
                </Link>
              </p>
              <p className="mt-1 text-[11px] text-[#A8B99C]">
                {relativeTime(card.at, card.exactTime)}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex gap-2.5">
            <span aria-hidden
              className="w-9 h-9 rounded-full bg-[#E8F0EA] text-[#175C3D] text-[12px] font-bold flex items-center justify-center shrink-0"
              style={{ fontFamily: "var(--font-body)" }}>
              {card.name.trim().charAt(0).toUpperCase() || "?"}
            </span>
            <div className="min-w-0" style={{ fontFamily: "var(--font-body)" }}>
              <Quote size={12} className="text-[#C6A667] mb-1" aria-hidden />
              <p className="text-[12.5px] leading-snug text-[#4a5247]">{card.text}</p>
              <p className="mt-1.5 text-[11px] text-[#6b7265]">
                <span className="font-semibold text-[#123D2B]">{card.name}</span>
                {card.date ? ` · ${card.date}` : ""}
              </p>
              <Link href={`/product/${card.slug}`}
                className="mt-1 inline-block text-[11px] font-medium text-[#175C3D] hover:underline truncate max-w-full">
                {card.product}
              </Link>
            </div>
          </div>
        )}

        <p className="mt-2.5 pt-2 border-t border-[#F4F0E4] text-[9.5px] text-[#A8B99C] leading-tight"
          style={{ fontFamily: "var(--font-body)" }}>
          {card.kind === "order"
            ? "Real orders, shown without names."
            : "Shared with permission. Individual experiences differ."}
        </p>
      </div>
    </div>
  );
}
