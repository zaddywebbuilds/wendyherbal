import Link from "next/link";
import { connection } from "next/server";
import { MessageSquareQuote, Clock, CheckCircle2, EyeOff, Plus, Pencil, AlertTriangle } from "lucide-react";
import { Stat } from "@/components/admin/Stat";
import { loadTestimonials, testimonialsStorageIsDurable, detectsMedicalClaim } from "@/lib/testimonials-store";
import { getCatalogueFresh } from "@/lib/catalogue";

export const metadata = { title: "Testimonials" };
export const instant = false;

const TONE: Record<string, { bg: string; fg: string; label: string }> = {
  draft: { bg: "#F3F4F6", fg: "#6B7280", label: "Draft" },
  pending: { bg: "#FEF3C7", fg: "#92400E", label: "Awaiting permission" },
  published: { bg: "#D1FAE5", fg: "#065F46", label: "Published" },
  rejected: { bg: "#FEE2E2", fg: "#991B1B", label: "Rejected" },
};

export default async function TestimonialsPage() {
  await connection();

  const [{ items }, catalogue] = await Promise.all([loadTestimonials(), getCatalogueFresh()]);
  const nameFor = (sku: string) => catalogue.find((p) => p.sku === sku)?.name ?? sku;

  const published = items.filter((t) => t.status === "published");
  const waiting = items.filter((t) => t.status === "pending" || t.status === "draft");
  const hidden = items.filter((t) => t.status === "rejected");
  const productsWith = new Set(published.map((t) => t.productSku)).size;
  const durable = testimonialsStorageIsDurable();

  return (
    <div className="p-5 lg:p-7 max-w-[1700px]">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[1.75rem] text-[#123D2B] font-medium"
            style={{ fontFamily: "var(--font-heading)" }}>
            Testimonials
          </h1>
          <p className="text-[13px] text-[#6b7265] mt-0.5" style={{ fontFamily: "var(--font-body)" }}>
            What customers have said, kept against the product it is about.
          </p>
        </div>

        <Link href="/admin/testimonials/new"
          className="inline-flex items-center gap-2 h-10 px-4 bg-[#123D2B] text-white rounded-lg text-[12.5px] font-semibold hover:bg-[#175C3D] transition-colors"
          style={{ fontFamily: "var(--font-body)" }}>
          <Plus size={15} /> Add testimonial
        </Link>
      </div>

      {!durable && (
        <div className="mb-5 rounded-xl border-l-[3px] border-[#92400E] bg-[#FEF3C7] p-4 text-[12.5px] leading-relaxed text-[#92400E]"
          style={{ fontFamily: "var(--font-body)" }}>
          <p className="font-semibold">Saving is off on this deployment</p>
          <p>Add a KV store (Upstash Redis) in Vercel, then testimonials can be saved.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <Stat label="Published" value={String(published.length)} icon={CheckCircle2}
          tint="#D1FAE5" color="#065F46" hint="Visible to customers" />
        <Stat label="Not published yet" value={String(waiting.length)} icon={Clock}
          tint="#FEF3C7" color="#92400E" hint="Drafts and ones awaiting permission" />
        <Stat label="Products covered" value={String(productsWith)} icon={MessageSquareQuote}
          tint="#E8F0EA" color="#175C3D" hint="Products with a published testimonial" />
        <Stat label="Kept but hidden" value={String(hidden.length)} icon={EyeOff}
          tint="#FEE2E2" color="#991B1B" hint="Rejected, never shown" />
      </div>

      <section className="bg-white rounded-xl border border-[#E9E4D6] p-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center px-6">
            <MessageSquareQuote size={30} className="text-[#A8B99C] mb-2.5" strokeWidth={1.4} />
            <p className="text-[13.5px] font-medium text-[#252B23]" style={{ fontFamily: "var(--font-body)" }}>
              No testimonials yet
            </p>
            <p className="text-[12px] text-[#A8B99C] mt-1 max-w-md leading-relaxed"
              style={{ fontFamily: "var(--font-body)" }}>
              Add one and choose the product it belongs to. Nothing appears on the website until
              you publish it and confirm the customer agreed.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-[#F4F0E4]" style={{ fontFamily: "var(--font-body)" }}>
            {items.map((t) => {
              const tone = TONE[t.status] ?? TONE.draft;
              const claim = detectsMedicalClaim(t.text);
              return (
                <li key={t.id} className="py-3.5 flex flex-wrap items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold"
                        style={{ background: tone.bg, color: tone.fg }}>
                        {tone.label}
                      </span>
                      {!t.consentConfirmed && (
                        <span className="px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] text-[10.5px] font-semibold">
                          No consent yet
                        </span>
                      )}
                      {claim && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FEE2E2] text-[#991B1B] text-[10.5px] font-semibold">
                          <AlertTriangle size={10} /> Medical claim
                        </span>
                      )}
                    </div>

                    <p className="mt-1.5 text-[13px] text-[#252B23] line-clamp-2">{t.text}</p>
                    <p className="mt-1 text-[11.5px] text-[#A8B99C]">
                      {t.displayName} · {nameFor(t.productSku)}
                      {t.source ? ` · ${t.source}` : ""}
                      {t.testimonialDate ? ` · ${t.testimonialDate}` : ""}
                    </p>
                  </div>

                  <Link href={`/admin/testimonials/${t.id}`}
                    className="shrink-0 inline-flex items-center gap-1.5 px-2.5 h-9 rounded-md bg-[#123D2B] text-white text-[11.5px] font-medium hover:bg-[#175C3D] transition-colors">
                    <Pencil size={12} /> Edit
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        <p className="mt-4 text-[11px] text-[#A8B99C] leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
          Only published testimonials with confirmed consent appear on the website. Crop phone
          numbers, surnames and medical details out of any screenshot before uploading it.
        </p>
      </section>
    </div>
  );
}
