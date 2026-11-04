"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { X, Quote } from "lucide-react";
import { cn } from "@/lib/cn";

interface Item {
  id: string;
  name: string;
  text: string;
  product: string;
  slug: string;
  date: string | null;
}

const FIRST_DELAY = 7000;   // let the page settle before anything slides in
const VISIBLE_MS = 9000;
const GAP_MS = 7000;
const DISMISS_KEY = "wh-testimonial-popup-dismissed";

/** Pages where a floating bubble is in the way rather than useful. */
const HIDDEN_ON = ["/checkout", "/admin", "/wishlist"];

export function TestimonialPopup() {
  const pathname = usePathname();
  const [items, setItems] = useState<Item[]>([]);
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(false);
  const [dismissed, setDismissed] = useState(true); // assume dismissed until checked
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const hiddenHere = HIDDEN_ON.some((p) => pathname.startsWith(p));

  // sessionStorage can throw in private mode, and a social proof bubble is
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

    fetch("/api/testimonials/popup")
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((data: { items: Item[] }) => {
        if (!cancelled) setItems(Array.isArray(data.items) ? data.items : []);
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [dismissed, hiddenHere]);

  // Show → hide → next, on a loop. Honours reduced-motion by holding each
  // card longer instead of cycling briskly.
  useEffect(() => {
    if (dismissed || hiddenHere || items.length === 0) return;

    const slow = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const visible = slow ? VISIBLE_MS * 2 : VISIBLE_MS;
    const clear = () => { timers.current.forEach(clearTimeout); timers.current = []; };

    const cycle = (delay: number) => {
      timers.current.push(setTimeout(() => {
        setShown(true);
        timers.current.push(setTimeout(() => {
          setShown(false);
          timers.current.push(setTimeout(() => {
            setIndex((i) => (i + 1) % items.length);
            cycle(0);
          }, 600));
        }, visible));
      }, delay));
    };

    cycle(FIRST_DELAY);
    return clear;
  }, [items, dismissed, hiddenHere]);

  function dismiss() {
    setShown(false);
    setDismissed(true);
    try { sessionStorage.setItem(DISMISS_KEY, "1"); } catch { /* fine */ }
  }

  if (dismissed || hiddenHere || items.length === 0) return null;

  const item = items[index];
  if (!item) return null;

  return (
    <div
      aria-live="polite"
      className={cn(
        "fixed z-40 left-3 right-3 bottom-3 sm:right-auto sm:w-[330px]",
        "transition-all duration-500 ease-out motion-reduce:transition-none",
        shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
      )}
    >
      <div className="relative rounded-xl bg-white border border-[#E7E0CF] shadow-[0_10px_34px_-12px_rgba(18,61,43,0.3)] p-3.5 pr-9">
        <button
          onClick={dismiss}
          aria-label="Hide customer notes"
          className="absolute top-2.5 right-2.5 p-1 text-[#A8B99C] hover:text-[#123D2B] transition-colors"
        >
          <X size={14} />
        </button>

        <div className="flex gap-2.5">
          <span
            aria-hidden
            className="w-8 h-8 rounded-full bg-[#E8F0EA] text-[#175C3D] text-[12px] font-bold flex items-center justify-center shrink-0"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {item.name.trim().charAt(0).toUpperCase() || "?"}
          </span>

          <div className="min-w-0">
            <Quote size={12} className="text-[#C6A667] mb-1" aria-hidden />
            <p
              className="text-[12.5px] leading-snug text-[#4a5247]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {item.text}
            </p>

            <p className="mt-1.5 text-[11px] text-[#6b7265]" style={{ fontFamily: "var(--font-body)" }}>
              <span className="font-semibold text-[#123D2B]">{item.name}</span>
              {item.date ? ` · ${item.date}` : ""}
            </p>

            <Link
              href={`/product/${item.slug}`}
              className="mt-1 inline-block text-[11px] font-medium text-[#175C3D] hover:underline truncate max-w-full"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {item.product}
            </Link>
          </div>
        </div>

        {/* Says what this is. A floating card of praise with no label reads as
            an advert; this is a customer note Wendy was given permission to show. */}
        <p className="mt-2.5 pt-2 border-t border-[#F4F0E4] text-[9.5px] text-[#A8B99C] leading-tight"
          style={{ fontFamily: "var(--font-body)" }}>
          Shared with permission. Individual experiences differ.
        </p>
      </div>
    </div>
  );
}
