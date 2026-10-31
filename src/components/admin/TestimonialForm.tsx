"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Save, Trash2, Loader2, AlertTriangle, Camera, X } from "lucide-react";
import type { Testimonial, TestimonialStatus } from "@/lib/testimonials-store";

interface ProductOption { sku: string; name: string }

interface Props {
  testimonial?: Testimonial;
  products: ProductOption[];
  durable: boolean;
}

/** Mirrors detectsMedicalClaim on the server, so the warning shows as you type. */
const CLAIM_PATTERNS = [
  /\bcure[ds]?\b/i, /\bcuring\b/i, /\bheal(ed|s|ing)?\b/i, /\btreat(ed|s|ment)?\b/i,
  /\bpregnan/i, /\bconceiv/i, /\bdiagnos/i, /\bdisease\b/i, /\binfection\b/i,
  /\bguarantee/i, /\bpermanent/i, /\bfibroid|pcos|hepatitis|ulcer|diabetes|cancer\b/i,
];
const readsAsClaim = (t: string) => CLAIM_PATTERNS.some((re) => re.test(t));

export function TestimonialForm({ testimonial, products, durable }: Props) {
  const router = useRouter();
  const creating = !testimonial;

  const [productSku, setProductSku] = useState(testimonial?.productSku ?? products[0]?.sku ?? "");
  const [displayName, setDisplayName] = useState(testimonial?.displayName ?? "");
  const [text, setText] = useState(testimonial?.text ?? "");
  const [source, setSource] = useState(testimonial?.source ?? "WhatsApp");
  const [date, setDate] = useState(testimonial?.testimonialDate ?? "");
  const [imageUrl, setImageUrl] = useState(testimonial?.imageUrl ?? "");
  const [consent, setConsent] = useState(testimonial?.consentConfirmed ?? false);
  const [claimOk, setClaimOk] = useState(testimonial?.claimAcknowledged ?? false);
  const [status, setStatus] = useState<TestimonialStatus>(testimonial?.status ?? "draft");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const claimy = readsAsClaim(text);

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/products/images", { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) setError(data.error ?? "Could not upload that image.");
      else setImageUrl(data.url);
    } finally {
      setUploading(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const payload = {
      productSku, displayName, text, source, testimonialDate: date,
      imageUrl, consentConfirmed: consent, claimAcknowledged: claimOk, status,
    };

    const res = await fetch(
      creating ? "/api/admin/testimonials" : `/api/admin/testimonials/${testimonial!.id}`,
      { method: creating ? "POST" : "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }
    );

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not save.");
      setBusy(false);
      return;
    }
    router.push("/admin/testimonials");
    router.refresh();
  }

  async function remove() {
    if (!window.confirm("Delete this testimonial?")) return;
    setBusy(true);
    await fetch(`/api/admin/testimonials/${testimonial!.id}`, { method: "DELETE" });
    router.push("/admin/testimonials");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-5" style={{ fontFamily: "var(--font-body)" }}>
      {!durable && (
        <Banner tone="warn">
          Saving is off because there is nowhere durable to store testimonials yet. Add a KV store
          in Vercel and this page starts working.
        </Banner>
      )}
      {error && <Banner tone="error">{error}</Banner>}

      <Field label="Which product" required>
        <select value={productSku} onChange={(e) => setProductSku(e.target.value)} className={input}>
          {products.map((p) => (
            <option key={p.sku} value={p.sku}>{p.name} ({p.sku})</option>
          ))}
        </select>
      </Field>

      <Field label="Customer name or initials" required
        hint="Use only what the customer agreed to. Initials are safer than a full name.">
        <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required
          maxLength={80} className={input} placeholder="A.O." />
      </Field>

      <Field label="What they said" required>
        <textarea value={text} onChange={(e) => setText(e.target.value)} required rows={5}
          maxLength={2000} className={`${input} h-auto py-2.5 resize-y`} />
      </Field>

      {claimy && (
        <Banner tone="warn">
          <p className="font-semibold mb-1">This reads as a medical claim</p>
          <p>
            The Medical Disclaimer on the site says Wendy Herbals publishes no claims of
            treatment or cure. Consider editing the wording. If you still want it published, tick
            the box below.
          </p>
          <label className="flex items-start gap-2.5 mt-2.5 cursor-pointer">
            <input type="checkbox" checked={claimOk} onChange={(e) => setClaimOk(e.target.checked)}
              className="w-5 h-5 accent-[#92400E] mt-px" />
            <span>I understand this is a medical claim and want it published anyway.</span>
          </label>
        </Banner>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Where it came from">
          <select value={source} onChange={(e) => setSource(e.target.value)} className={input}>
            {["WhatsApp", "Facebook", "In person", "Phone call", "Other"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Field>
        <Field label="When" hint="Optional">
          <input value={date} onChange={(e) => setDate(e.target.value)} className={input}
            placeholder="October 2026" maxLength={40} />
        </Field>
      </div>

      <Field label="Screenshot or photo"
        hint="Optional. Crop out phone numbers, surnames and anything medical before uploading.">
        <div className="flex flex-wrap items-start gap-2.5">
          {imageUrl && (
            <span className="relative w-24 h-24 rounded-lg overflow-hidden border border-[#E9E4D6]">
              <Image src={imageUrl} alt="" fill sizes="96px" className="object-cover" />
              <button type="button" onClick={() => setImageUrl("")} aria-label="Remove image"
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center">
                <X size={12} />
              </button>
            </span>
          )}
          <label className="w-24 h-24 rounded-lg border border-dashed border-[#175C3D] text-[#175C3D] flex flex-col items-center justify-center gap-1 text-[10.5px] cursor-pointer">
            {uploading ? <Loader2 size={17} className="animate-spin" /> : <Camera size={17} />}
            {uploading ? "Sending" : "Upload"}
            <input type="file" accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={upload} disabled={uploading} className="sr-only" />
          </label>
        </div>
      </Field>

      <div className="rounded-xl border border-[#E9E4D6] bg-[#FCFAF3] p-4">
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)}
            className="w-5 h-5 accent-[#123D2B] mt-px" />
          <span className="text-[12.5px] leading-relaxed text-[#4a5247]">
            <span className="font-semibold text-[#252B23]">
              This customer agreed to their words appearing on the website.
            </span>{" "}
            Nothing can be published without this. If you are not sure, ask them first and leave
            it as a draft until they say yes.
          </span>
        </label>
      </div>

      <Field label="Status">
        <select value={status} onChange={(e) => setStatus(e.target.value as TestimonialStatus)}
          className={input}>
          <option value="draft">Draft, only you can see it</option>
          <option value="pending">Waiting on the customer&rsquo;s permission</option>
          <option value="published">Published on the product page</option>
          <option value="rejected">Rejected, keep it but never show it</option>
        </select>
      </Field>

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button type="submit" disabled={busy || !durable}
          className="inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-[#123D2B] text-white text-[13px] font-semibold disabled:opacity-50 hover:bg-[#175C3D] transition-colors">
          {busy ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {creating ? "Save testimonial" : "Save changes"}
        </button>
        {!creating && (
          <button type="button" onClick={remove} disabled={busy}
            className="inline-flex items-center gap-2 h-11 px-4 rounded-lg border border-[#E9E4D6] text-[#991B1B] text-[13px] font-medium disabled:opacity-50 hover:border-[#991B1B] transition-colors">
            <Trash2 size={15} /> Delete
          </button>
        )}
      </div>
    </form>
  );
}

const input =
  "w-full h-11 px-3 bg-white border border-[#E9E4D6] rounded-lg text-[16px] sm:text-[13px] " +
  "text-[#252B23] placeholder-[#A8B99C] focus:outline-none focus:border-[#175C3D]";

function Field({ label, hint, required, children }: {
  label: string; hint?: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[12px] font-medium text-[#252B23] mb-1.5">
        {label} {required && <span className="text-[#C06014]">*</span>}
      </span>
      {children}
      {hint && <span className="block mt-1 text-[11.5px] text-[#A8B99C]">{hint}</span>}
    </label>
  );
}

function Banner({ tone, children }: { tone: "warn" | "error"; children: React.ReactNode }) {
  const s = tone === "error"
    ? { bg: "#FEE2E2", border: "#991B1B", fg: "#991B1B" }
    : { bg: "#FEF3C7", border: "#92400E", fg: "#92400E" };
  return (
    <div className="rounded-xl border-l-[3px] p-3.5 flex gap-2.5 text-[12.5px] leading-relaxed"
      style={{ background: s.bg, borderLeftColor: s.border, color: s.fg }}>
      <AlertTriangle size={16} className="shrink-0 mt-[1px]" />
      <div>{children}</div>
    </div>
  );
}
