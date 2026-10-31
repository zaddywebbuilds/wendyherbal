import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeft } from "lucide-react";
import { TestimonialForm } from "@/components/admin/TestimonialForm";
import { getCatalogueFresh } from "@/lib/catalogue";
import { loadTestimonials, testimonialsStorageIsDurable } from "@/lib/testimonials-store";

export const instant = false;

export default async function EditTestimonialPage({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;

  const { items } = await loadTestimonials();
  const testimonial = items.find((t) => t.id === id);
  if (!testimonial) notFound();

  const products = (await getCatalogueFresh()).map((p) => ({ sku: p.sku, name: p.name }));

  return (
    <div className="p-5 lg:p-7 max-w-3xl">
      <Link href="/admin/testimonials"
        className="inline-flex items-center gap-1.5 text-[12.5px] text-[#175C3D] mb-4 hover:underline"
        style={{ fontFamily: "var(--font-body)" }}>
        <ArrowLeft size={14} /> Back to testimonials
      </Link>

      <h1 className="text-[1.75rem] text-[#123D2B] font-medium mb-6"
        style={{ fontFamily: "var(--font-heading)" }}>
        Edit testimonial
      </h1>

      <TestimonialForm testimonial={testimonial} products={products}
        durable={testimonialsStorageIsDurable()} />
    </div>
  );
}
