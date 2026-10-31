import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  mutateTestimonials, loadTestimonials, testimonialsStorageIsDurable, detectsMedicalClaim,
  type TestimonialStatus,
} from "@/lib/testimonials-store";
import { getCatalogueFresh } from "@/lib/catalogue";

const STATUSES: TestimonialStatus[] = ["draft", "pending", "published", "rejected"];
const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

function notDurable() {
  return NextResponse.json(
    { error: "Testimonials would not survive a restart. Add a KV store in Vercel first." },
    { status: 503 }
  );
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!testimonialsStorageIsDurable()) return notDurable();

  const { id } = await params;
  const { items } = await loadTestimonials();
  const existing = items.find((t) => t.id === id);
  if (!existing) return NextResponse.json({ error: "No testimonial with that id." }, { status: 404 });

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const text = str(body.text, 2000) || existing.text;
  const status = STATUSES.includes(body.status as TestimonialStatus)
    ? (body.status as TestimonialStatus)
    : existing.status;
  const consentConfirmed =
    body.consentConfirmed === undefined ? existing.consentConfirmed : Boolean(body.consentConfirmed);
  const claimAcknowledged =
    body.claimAcknowledged === undefined ? existing.claimAcknowledged : Boolean(body.claimAcknowledged);

  // The same two refusals as on create. They are the point of the feature.
  if (status === "published" && !consentConfirmed) {
    return NextResponse.json(
      { error: "This cannot be published until you confirm the customer agreed to it." },
      { status: 400 }
    );
  }
  if (status === "published" && detectsMedicalClaim(text) && !claimAcknowledged) {
    return NextResponse.json(
      {
        error:
          "This testimonial reads as a medical claim. Tick the acknowledgement to publish it " +
          "anyway, or edit the wording.",
      },
      { status: 400 }
    );
  }

  const imageUrl = body.imageUrl === undefined ? existing.imageUrl : str(body.imageUrl, 400) || undefined;
  if (imageUrl && !imageUrl.startsWith("/media/") &&
      !/^https:\/\/[^/]+\.public\.blob\.vercel-storage\.com\//.test(imageUrl)) {
    return NextResponse.json({ error: "Images must be uploaded here." }, { status: 400 });
  }

  const now = new Date().toISOString();
  await mutateTestimonials((s) => {
    const t = s.items.find((x) => x.id === id)!;
    t.displayName = str(body.displayName, 80) || t.displayName;
    t.text = text;
    t.imageUrl = imageUrl;
    t.source = body.source === undefined ? t.source : str(body.source, 60) || undefined;
    t.testimonialDate =
      body.testimonialDate === undefined ? t.testimonialDate : str(body.testimonialDate, 40) || undefined;
    t.consentConfirmed = consentConfirmed;
    t.claimAcknowledged = claimAcknowledged;
    if (status === "published" && t.status !== "published") t.publishedAt = now;
    t.status = status;
    t.updatedAt = now;
    return s;
  });

  const product = (await getCatalogueFresh()).find((p) => p.sku === existing.productSku);
  if (product) revalidatePath(`/product/${product.slug}`, "page");

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!testimonialsStorageIsDurable()) return notDurable();

  const { id } = await params;
  const { items } = await loadTestimonials();
  const existing = items.find((t) => t.id === id);

  await mutateTestimonials((s) => {
    s.items = s.items.filter((t) => t.id !== id);
    return s;
  });

  if (existing) {
    const product = (await getCatalogueFresh()).find((p) => p.sku === existing.productSku);
    if (product) revalidatePath(`/product/${product.slug}`, "page");
  }

  return NextResponse.json({ ok: true });
}
