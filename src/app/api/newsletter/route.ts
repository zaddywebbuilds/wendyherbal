import { NextResponse } from "next/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: Request) {
  let email: unknown;
  try {
    ({ email } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  // Persistence is wired once Supabase credentials are configured. Until then the
  // endpoint validates and reports honestly rather than pretending to store.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { message: "Newsletter storage is not configured yet — your address was not saved." },
      { status: 200 }
    );
  }

  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false } }
    );

    const { error } = await supabase
      .from("newsletter_subscriptions")
      .upsert({ email: email.trim().toLowerCase(), consented_at: new Date().toISOString() },
        { onConflict: "email" });

    if (error) throw error;
    return NextResponse.json({ message: "You're on the list. Thank you." }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Could not save your address. Please try again." }, { status: 500 });
  }
}
