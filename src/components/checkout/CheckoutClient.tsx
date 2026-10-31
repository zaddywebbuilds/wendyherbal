"use client";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import {
  ChevronLeft, Copy, Check, MessageCircle, Landmark, ShoppingBag, Info,
} from "lucide-react";
import { useCartStore } from "@/store/cart";
import { ProductImage } from "@/components/ui/ProductImage";
import { FORMAT_NGN, BANK_DETAILS, DELIVERY_NOTE } from "@/lib/constants";
import { generateOrderNumber, orderWhatsAppUrl, NIGERIAN_STATES } from "@/lib/order";
import type { Address } from "@/lib/types";
import { cn } from "@/lib/cn";

type Step = "details" | "confirm";

const EMPTY: Address = { full_name: "", phone: "", state: "", city: "", street: "", landmark: "" };

export function CheckoutClient() {
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());
  const clearCart = useCartStore((s) => s.clearCart);

  const [step, setStep] = useState<Step>("details");
  const [address, setAddress] = useState<Address>(EMPTY);
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [consent, setConsent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveNote, setSaveNote] = useState<string | null>(null);

  const set = (k: keyof Address) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setAddress((a) => ({ ...a, [k]: e.target.value }));

  function copy(text: string, key: string) {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1800);
    }).catch(() => {});
  }

  async function onSubmitDetails(e: FormEvent) {
    e.preventDefault();
    const number = generateOrderNumber();
    setOrderNumber(number);
    setStep("confirm");
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Record the buyer so Wendy can follow up later. The payment handoff does
    // not depend on this succeeding.
    setSaving(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: number,
          items: items.map((i) => ({ sku: i.product.sku, quantity: i.quantity, size: i.size })),
          customer: { ...address, email },
          notes,
          marketingConsent: consent,
        }),
      });
      const data = await res.json();
      setSaveNote(data.saved ? null : (data.message ?? data.error ?? null));
    } catch {
      setSaveNote("We could not save your order details, but your order can still be sent on WhatsApp.");
    } finally {
      setSaving(false);
    }
  }

  const waUrl = orderWhatsAppUrl({ orderNumber, items, subtotal, address, notes });

  /* ---------------- empty cart ---------------- */
  if (items.length === 0 && step === "details") {
    return (
      <div className="bg-[#F7F4E9] min-h-[70vh] flex flex-col items-center justify-center px-5 text-center">
        <ShoppingBag size={40} className="text-[#A8B99C] mb-3" strokeWidth={1.3} />
        <h1 className="text-[1.7rem] text-[#123D2B]" style={{ fontFamily: "var(--font-heading)" }}>
          Your bag is empty
        </h1>
        <p className="text-[13px] text-[#6b7265] mt-1 mb-5" style={{ fontFamily: "var(--font-body)" }}>
          Add a few products before checking out.
        </p>
        <Link href="/shop"
          className="px-7 py-3 bg-[#123D2B] text-white text-[13px] font-medium rounded-md hover:bg-[#175C3D] transition-colors"
          style={{ fontFamily: "var(--font-body)" }}>
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#F7F4E9] min-h-screen">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Steps */}
        <div className="flex items-center gap-2 mb-7" style={{ fontFamily: "var(--font-body)" }}>
          {(["details", "confirm"] as Step[]).map((s, i) => {
            const active = step === s;
            const done = step === "confirm" && s === "details";
            return (
              <div key={s} className="flex items-center gap-2">
                <span className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold",
                  done ? "bg-[#175C3D] text-white" : active ? "bg-[#123D2B] text-white" : "bg-[#E7E0CF] text-[#6b7265]")}>
                  {done ? <Check size={12} /> : i + 1}
                </span>
                <span className={cn("text-[12.5px]", active || done ? "text-[#123D2B] font-medium" : "text-[#6b7265]")}>
                  {s === "details" ? "Delivery Details" : "Confirm Order"}
                </span>
                {i === 0 && <span className="w-8 h-px bg-[#E7E0CF] mx-1" />}
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-[1fr_340px] gap-7">
          {/* ---------------- left ---------------- */}
          <div>
            {step === "details" ? (
              <form onSubmit={onSubmitDetails} className="bg-white rounded-xl border border-[#E9E4D6] p-5 sm:p-6">
                <h1 className="text-[1.5rem] text-[#123D2B] mb-5" style={{ fontFamily: "var(--font-heading)" }}>
                  Delivery Details
                </h1>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Full name" required value={address.full_name} onChange={set("full_name")} />
                  <Field label="Phone number" required type="tel" value={address.phone} onChange={set("phone")}
                    placeholder="0803 000 0000" />
                  <div className="sm:col-span-2">
                    <Field label="Email address" type="email" value={email}
                      onChange={(e) => setEmail(e.target.value)} placeholder="For your order confirmation" />
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-[#252B23] mb-1.5"
                      style={{ fontFamily: "var(--font-body)" }}>
                      State <span className="text-[#C06014]">*</span>
                    </label>
                    <select required value={address.state} onChange={set("state")}
                      className="w-full h-11 px-3 bg-white border border-[#E7E0CF] rounded-md text-[16px] sm:text-[13px] text-[#252B23] focus:outline-none focus:border-[#175C3D]"
                      style={{ fontFamily: "var(--font-body)" }}>
                      <option value="">Select state</option>
                      {NIGERIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <Field label="City / Town" required value={address.city} onChange={set("city")} />

                  <div className="sm:col-span-2">
                    <Field label="Delivery address" required value={address.street} onChange={set("street")} />
                  </div>
                  <div className="sm:col-span-2">
                    <Field label="Landmark (optional)" value={address.landmark ?? ""} onChange={set("landmark")} />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[12px] font-medium text-[#252B23] mb-1.5"
                      style={{ fontFamily: "var(--font-body)" }}>Order notes (optional)</label>
                    <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)}
                      placeholder="Anything Wendy should know about your order or delivery"
                      className="w-full px-3 py-2.5 bg-white border border-[#E7E0CF] rounded-md text-[16px] sm:text-[13px] text-[#252B23] placeholder-[#A8B99C] focus:outline-none focus:border-[#175C3D] resize-y"
                      style={{ fontFamily: "var(--font-body)" }} />
                  </div>
                </div>

                {/* Marketing opt-in — separate from the order itself, never pre-ticked. */}
                <label className="mt-5 flex items-start gap-2.5 cursor-pointer">
                  <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-[#123D2B] shrink-0" />
                  <span className="text-[12px] leading-relaxed text-[#4a5245]"
                    style={{ fontFamily: "var(--font-body)" }}>
                    Keep me updated — I&rsquo;m happy for Wendy Herbals to contact me about my
                    wellness journey, new products and offers. You can ask to be removed at any time.
                  </span>
                </label>

                <button type="submit"
                  className="mt-5 w-full h-12 bg-[#123D2B] text-white text-[14px] font-medium rounded-md hover:bg-[#175C3D] transition-colors active:scale-[0.99]"
                  style={{ fontFamily: "var(--font-body)" }}>
                  Review &amp; Send Order
                </button>

                <Link href="/shop"
                  className="mt-3 flex items-center justify-center gap-1.5 text-[12.5px] text-[#6b7265] hover:text-[#123D2B] transition-colors"
                  style={{ fontFamily: "var(--font-body)" }}>
                  <ChevronLeft size={14} /> Continue shopping
                </Link>
              </form>
            ) : (
              /* ---------------- confirm ---------------- */
              <div className="bg-white rounded-xl border border-[#E9E4D6] p-5 sm:p-6">
                <div className="flex items-start gap-3 mb-5">
                  <span className="w-10 h-10 rounded-xl bg-[#E8F0EA] flex items-center justify-center shrink-0">
                    <Landmark size={19} className="text-[#175C3D]" strokeWidth={1.8} />
                  </span>
                  <div>
                    <h1 className="text-[1.4rem] text-[#123D2B] leading-tight"
                      style={{ fontFamily: "var(--font-heading)" }}>
                      Send your order for confirmation
                    </h1>
                    <p className="text-[12.5px] text-[#6b7265] mt-0.5" style={{ fontFamily: "var(--font-body)" }}>
                      Order <span className="font-semibold text-[#123D2B]">{orderNumber}</span>
                    </p>
                  </div>
                </div>

                {/* What happens next, before any money is mentioned. */}
                <ol className="space-y-2.5 mb-5">
                  {[
                    "Send your order on WhatsApp using the button below.",
                    "Wendy confirms the way bill for your area and your full total.",
                    "Transfer that confirmed total to the account below.",
                    "Send your receipt. The order is confirmed once the transfer is checked.",
                  ].map((t, i) => (
                    <li key={i} className="flex gap-2.5 text-[12.5px] text-[#4a5245]"
                      style={{ fontFamily: "var(--font-body)" }}>
                      <span className="w-5 h-5 rounded-full bg-[#EFE9DD] text-[#123D2B] text-[10px] font-bold flex items-center justify-center shrink-0 mt-px">
                        {i + 1}
                      </span>
                      {t}
                    </li>
                  ))}
                </ol>

                {/* Bank details */}
                <div className="rounded-lg border border-[#C6A667]/40 bg-[#FDF9EF] p-4 space-y-3">
                  <Row label="Bank" value={BANK_DETAILS.bank} />
                  <Row label="Account number" value={BANK_DETAILS.accountNumber} mono
                    onCopy={() => copy(BANK_DETAILS.accountNumber, "acct")} copied={copied === "acct"} />
                  <Row label="Account name" value={BANK_DETAILS.accountName} />
                  <div className="pt-3 border-t border-[#C6A667]/30 flex items-center justify-between">
                    <span className="text-[12px] text-[#6b7265]" style={{ fontFamily: "var(--font-body)" }}>
                      Products subtotal
                    </span>
                    <button type="button" onClick={() => copy(String(subtotal), "amt")}
                      className="flex items-center gap-1.5 text-[1.15rem] font-bold text-[#123D2B] hover:text-[#175C3D]"
                      style={{ fontFamily: "var(--font-body)" }}>
                      {FORMAT_NGN(subtotal)}
                      {copied === "amt" ? <Check size={14} className="text-[#175C3D]" /> : <Copy size={14} className="text-[#A8B99C]" />}
                    </button>
                  </div>
                </div>

                {/* Way bill note */}
                <div className="mt-3 flex gap-2.5 p-3 bg-[#FBF0DE] border border-[#C6A667]/30 rounded-lg">
                  <Info size={15} className="text-[#B5713A] shrink-0 mt-0.5" />
                  <p className="text-[11.5px] leading-relaxed text-[#6b4a22]" style={{ fontFamily: "var(--font-body)" }}>
                    <span className="font-semibold">Do not transfer yet.</span> {DELIVERY_NOTE} Wendy
                    confirms the way bill on WhatsApp, and your total is the subtotal above plus that
                    amount.
                  </p>
                </div>

                {saveNote && !saving && (
                  <p className="mt-4 text-[11.5px] text-[#B5713A] leading-relaxed"
                    style={{ fontFamily: "var(--font-body)" }} role="status">
                    {saveNote} Your details are still included in the WhatsApp message below.
                  </p>
                )}

                <a href={waUrl} target="_blank" rel="noopener noreferrer"
                  onClick={() => setSent(true)}
                  className="mt-6 w-full h-12 flex items-center justify-center gap-2 bg-[#25D366] text-white text-[14px] font-semibold rounded-md hover:bg-[#1FB855] transition-colors active:scale-[0.99]"
                  style={{ fontFamily: "var(--font-body)" }}>
                  <MessageCircle size={17} /> Send My Order on WhatsApp
                </a>

                {sent && (
                  <div className="mt-4 p-3.5 rounded-lg bg-[#E8F0EA] border border-[#175C3D]/25">
                    <p className="text-[12.5px] text-[#175C3D] font-medium" style={{ fontFamily: "var(--font-body)" }}>
                      WhatsApp opened with your order details.
                    </p>
                    <p className="text-[11.5px] text-[#4a5245] mt-1" style={{ fontFamily: "var(--font-body)" }}>
                      Wendy will reply with the way bill and your full total. Transfer that amount,
                      then send her the receipt.
                    </p>
                    <button onClick={() => { clearCart(); setStep("details"); setAddress(EMPTY); setNotes(""); setSent(false); }}
                      className="mt-2.5 text-[12px] font-medium text-[#123D2B] underline underline-offset-2"
                      style={{ fontFamily: "var(--font-body)" }}>
                      Clear my bag
                    </button>
                  </div>
                )}

                <button onClick={() => setStep("details")}
                  className="mt-3 w-full flex items-center justify-center gap-1.5 text-[12.5px] text-[#6b7265] hover:text-[#123D2B] transition-colors"
                  style={{ fontFamily: "var(--font-body)" }}>
                  <ChevronLeft size={14} /> Edit delivery details
                </button>
              </div>
            )}
          </div>

          {/* ---------------- summary ---------------- */}
          <aside className="lg:sticky lg:top-24 h-fit bg-white rounded-xl border border-[#E9E4D6] p-5">
            <h2 className="text-[14px] font-semibold text-[#123D2B] mb-3.5"
              style={{ fontFamily: "var(--font-body)" }}>
              Order Summary
            </h2>

            <ul className="space-y-3 max-h-[300px] overflow-y-auto">
              {items.map((i) => (
                <li key={i.size ? `${i.product_id}-${i.size}` : i.product_id} className="flex gap-2.5">
                  <ProductImage src={i.product.images[0]} alt={i.product.name} category={i.product.category}
                    className="w-12 h-12 rounded-md shrink-0" sizes="48px" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-medium text-[#252B23] leading-snug line-clamp-2"
                      style={{ fontFamily: "var(--font-body)" }}>{i.product.name}</p>
                    <p className="text-[11px] text-[#6b7265]" style={{ fontFamily: "var(--font-body)" }}>
                      Qty {i.quantity}
                    </p>
                  </div>
                  <span className="text-[12px] font-semibold text-[#123D2B] shrink-0 tabular-nums"
                    style={{ fontFamily: "var(--font-body)" }}>
                    {FORMAT_NGN((i.product.price ?? 0) * i.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-4 pt-3.5 border-t border-[#EFE9DD] space-y-1.5"
              style={{ fontFamily: "var(--font-body)" }}>
              <div className="flex justify-between text-[12.5px] text-[#6b7265]">
                <span>Subtotal</span><span className="tabular-nums">{FORMAT_NGN(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[12.5px] text-[#6b7265]">
                <span>Way bill</span><span className="text-[11.5px]">Confirmed on WhatsApp</span>
              </div>
              <div className="flex justify-between pt-2 mt-1 border-t border-[#EFE9DD]">
                {/* Not "Total": the way bill is still to be added, and calling this
                    the total is what the review flagged as misleading. */}
                <span className="text-[13px] font-semibold text-[#123D2B]">Products total</span>
                <span className="text-[1.05rem] font-bold text-[#123D2B] tabular-nums">{FORMAT_NGN(subtotal)}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

/* ---------------- small pieces ---------------- */

function Field({ label, required, ...props }: {
  label: string; required?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-[12px] font-medium text-[#252B23] mb-1.5"
        style={{ fontFamily: "var(--font-body)" }}>
        {label} {required && <span className="text-[#C06014]">*</span>}
      </label>
      <input required={required} {...props}
        className="w-full h-11 px-3 bg-white border border-[#E7E0CF] rounded-md text-[16px] sm:text-[13px] text-[#252B23] placeholder-[#A8B99C] focus:outline-none focus:border-[#175C3D]"
        style={{ fontFamily: "var(--font-body)" }} />
    </div>
  );
}

function Row({ label, value, mono, onCopy, copied }: {
  label: string; value: string; mono?: boolean; onCopy?: () => void; copied?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3" style={{ fontFamily: "var(--font-body)" }}>
      <span className="text-[12px] text-[#6b7265] shrink-0">{label}</span>
      {onCopy ? (
        <button type="button" onClick={onCopy}
          className={cn("flex items-center gap-1.5 text-[14px] font-semibold text-[#123D2B] hover:text-[#175C3D]",
            mono && "tracking-wider tabular-nums")}>
          {value}
          {copied ? <Check size={14} className="text-[#175C3D]" /> : <Copy size={14} className="text-[#A8B99C]" />}
        </button>
      ) : (
        <span className={cn("text-[14px] font-semibold text-[#123D2B] text-right", mono && "tracking-wider")}>
          {value}
        </span>
      )}
    </div>
  );
}
