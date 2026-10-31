import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  mutateTestimonials, testimonialsStorageIsDurable, detectsMedicalClaim,
  type Testimonial, type TestimonialStatus,
} from "@/lib/testimonials-store";
import { getCatalogueFresh } from "@/lib/catalogue";

const STATUSES: TestimonialStatus[] = ["draft", "pending", "published", "rejected"];

const str = (v: unknown, max: number) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

function notDurable() {
  return NextResponse.json(
    {
      error:
        "Testimonials would not survive a restart. Add a KV store (Upstash Redis) in Vercel " +
        "first, otherwise anything saved here disappears on the next cold start.",
    },
    { status: 503 }
  );
}

/**
 * Shared checks for create and update.
 *
 * Two of these are refusals rather than warnings, because they protect the
 * customer rather than the shop: nothing publishes without consent, and
 * nothing containing a medical claim publishes without a separate explicit
 * acknowledgement.
 */
function validate(body: Record<string, unknown>, existing?: Testimonial) {
  const productSku = str(body.productSku, 40) || existing?.productSku || "";
  const displayName = str(body.displayName, 80);
  const text = str(body.text, 2000);
  const status = STATUSES.includes(body.status as TestimonialStatus)
    ? (body.status as TestimonialStatus)
    : existing?.status ?? "draft";
  const consentConfirmed = Boolean(body.consentConfirmed);
  const claimAcknowledged = Boolean(body.claimAcknowledged);

  if (!productSku) return { error: "Choose the product this testimonial belongs to." };
  if (!displayName) return { error: "Add a name or initials the customer agreed to." };
  if (!text) return { error: "The testimonial cannot be empty." };

  const imageUrl = str(body.imageUrl, 400);
  if (imageUrl && !imageUrl.startsWith("/media/") &&
      !/^https:\/\/[^/]+\.public\.blob\.vercel-storage\.com\//.test(imageUrl)) {
    return { error: "A testimonial image must be uploaded here rather than linked from elsewhere." };
  }

  if (status === "published" && !consentConfirmed) {
    return {
      error:
        "This cannot be published until you confirm the customer agreed to it appearing on the " +
        "website.",
    };
  }

  if (status === "published" && detectsMedicalClaim(text) && !claimAcknowledged) {
    return {
      error:
        "This testimonial reads as a medical claim. The site's Medical Disclaimer says Wendy " +
        "Herbals publishes none, so tick the acknowledgement if you still want it public, or " +
        "edit the wording.",
    };
  }

  return {
    value: {
      productSku,
      displayName,
      text,
      imageUrl: imageUrl || undefined,
      source: str(body.source, 60) || undefined,
      testimonialDate: str(body.testimonialDate, 40) || undefined,
      consentConfirmed,
      claimAcknowledged,
      status,
    },
  };
}

export async function POST(req: Request) {
  if (!testimonialsStorageIsDurable()) return notDurable();

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const checked = validate(body);
  if (checked.error) return NextResponse.json({ error: checked.error }, { status: 400 });
  const v = checked.value!;

  const catalogue = await getCatalogueFresh();
  const product = catalogue.find((p) => p.sku === v.productSku);
  if (!product) {
    return NextResponse.json({ error: "No product with that SKU." }, { status: 404 });
  }

  const now = new Date().toISOString();
  const entry: Testimonial = {
    id: `t-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    ...v,
    createdAt: now,
    updatedAt: now,
    publishedAt: v.status === "published" ? now : undefined,
  };

  await mutateTestimonials((s) => {
    s.items.unshift(entry);
    return s;
  });

  revalidatePath(`/product/${product.slug}`, "page");
  return NextResponse.json({ testimonial: entry }, { status: 201 });
}

export { validate };
