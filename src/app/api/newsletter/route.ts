import { NextResponse } from "next/server";
import { addSubscriber, newsletterStorageIsDurable } from "@/lib/newsletter-store";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: Request) {
  let email: unknown;
  let source: unknown;
  try {
    ({ email, source } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  // Still honest when there is nowhere durable to put it: on Vercel without a
  // KV store the address would vanish on the next cold start, and telling
  // someone they are on a list they are not on is worse than saying no.
  if (!newsletterStorageIsDurable()) {
    return NextResponse.json(
      {
        message:
          "We could not save your address just yet. Please message us on WhatsApp and we will " +
          "add you by hand.",
      },
      { status: 200 }
    );
  }

  try {
    const where = typeof source === "string" ? source.trim().slice(0, 40) : "website";
    const outcome = await addSubscriber(email, where || "website");

    return NextResponse.json(
      {
        message:
          outcome === "already"
            ? "You are already on the list. Thank you."
            : "You're on the list. Thank you.",
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Newsletter sign-up failed:", err);
    return NextResponse.json(
      { error: "Could not save your address. Please try again." },
      { status: 500 }
    );
  }
}
