import Link from "next/link";
import { connection } from "next/server";
import { ArrowLeft } from "lucide-react";
import { TestimonialForm } from "@/components/admin/TestimonialForm";
import { getCatalogueFresh } from "@/lib/catalogue";
import { testimonialsStorageIsDurable } from "@/lib/testimonials-store";

export const metadata = { title: "Add a testimonial" };
export const instant = false;

export default async function NewTestimonialPage() {
  await connection();
  const products = (await getCatalogueFresh()).map((p) => ({ sku: p.sku, name: p.name }));

  return (
    <div className="p-5 lg:p-7 max-w-3xl">
      <Link href="/admin/testimonials"
        className="inline-flex items-center gap-1.5 text-[12.5px] text-[#175C3D] mb-4 hover:underline"
        style={{ fontFamily: "var(--font-body)" }}>
        <ArrowLeft size={14} /> Back to testimonials
      </Link>

      <h1 className="text-[1.75rem] text-[#123D2B] font-medium mb-1"
        style={{ fontFamily: "var(--font-heading)" }}>
        Add a testimonial
      </h1>
      <p className="text-[13px] text-[#6b7265] mb-6" style={{ fontFamily: "var(--font-body)" }}>
        It appears on the product page only once you set it to published and confirm the customer
        agreed.
      </p>

      <TestimonialForm products={products} durable={testimonialsStorageIsDurable()} />
    </div>
  );
}
