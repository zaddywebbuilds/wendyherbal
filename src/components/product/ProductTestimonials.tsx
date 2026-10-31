import Image from "next/image";
import { Quote } from "lucide-react";
import type { Testimonial } from "@/lib/testimonials-store";

/**
 * What customers have said about this one product.
 *
 * Only entries Wendy has published with confirmed consent reach this
 * component; the filtering happens in publishedFor. Nothing is rendered at
 * all when there is nothing to show, rather than an empty "no reviews yet"
 * shell that invites the shop to invent some.
 */
export function ProductTestimonials({ items }: { items: Testimonial[] }) {
  if (items.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="text-[1.7rem] text-[#123D2B] font-medium mb-1"
        style={{ fontFamily: "var(--font-heading)" }}>
        Customer Experiences
      </h2>
      <p className="text-[12.5px] text-[#6b7265] mb-5" style={{ fontFamily: "var(--font-body)" }}>
        Shared with permission. Individual experiences differ and are not medical advice.
      </p>

      <ul className="grid sm:grid-cols-2 gap-3.5">
        {items.map((t) => (
          <li key={t.id}
            className="flex flex-col rounded-xl border border-[#EFE9DD] bg-white overflow-hidden">
            {t.imageUrl && (
              <div className="relative aspect-[4/3] bg-[#EFE9DD]">
                <Image src={t.imageUrl} alt="" fill sizes="(max-width:640px) 100vw, 45vw"
                  className="object-cover" />
              </div>
            )}
            <div className="p-4" style={{ fontFamily: "var(--font-body)" }}>
              <Quote size={16} className="text-[#C6A667] mb-2" />
              <p className="text-[13.5px] leading-relaxed text-[#4a5247]">{t.text}</p>
              <p className="mt-3 text-[11.5px] text-[#A8B99C]">
                {t.displayName}
                {t.testimonialDate ? ` · ${t.testimonialDate}` : ""}
                {t.source ? ` · via ${t.source}` : ""}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
