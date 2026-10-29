import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { PRODUCTS } from "@/lib/products";

interface IncomingItem { sku: string; quantity: number; size?: string }

interface IncomingOrder {
  orderNumber: string;
  items: IncomingItem[];
  customer: {
    full_name: string;
    phone: string;
    email?: string;
    state: string;
    city: string;
    street: string;
    landmark?: string;
  };
  notes?: string;
  marketingConsent?: boolean;
}

const str = (v: unknown, max = 200) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

export async function POST(req: Request) {
  let body: IncomingOrder;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const orderNumber = str(body?.orderNumber, 40);
  const c = body?.customer;
  const fullName = str(c?.full_name, 120);
  const phone = str(c?.phone, 40);

  if (!orderNumber || !fullName || !phone) {
    return NextResponse.json({ error: "Name and phone number are required." }, { status: 400 });
  }
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "Your order has no items." }, { status: 400 });
  }

  // Price server-side from the catalogue — never trust amounts sent by the browser.
  const priced = [];
  for (const raw of body.items) {
    const product = PRODUCTS.find((p) => p.sku === str(raw?.sku, 40));
    const qty = Number(raw?.quantity);
    if (!product || !Number.isInteger(qty) || qty < 1 || qty > 99) {
      return NextResponse.json({ error: "One of the items in your order is not valid." }, { status: 400 });
    }
    if (product.price === null) {
      return NextResponse.json(
        { error: `${product.name} has no published price and must be ordered by enquiry.` },
        { status: 400 }
      );
    }
    priced.push({
      product_sku: product.sku,
      product_name: product.name,
      quantity: qty,
      unit_price: product.price,
      size: str(raw?.size, 40) || null,
    });
  }

  const subtotal = priced.reduce((s, i) => s + i.unit_price * i.quantity, 0);
  const consent = body.marketingConsent === true;

  const supabase = getServiceClient();
  if (!supabase) {
    // Be honest rather than returning a fake success: the WhatsApp handoff still
    // carries the order, but nothing was saved for later outreach.
    return NextResponse.json(
      {
        saved: false,
        orderNumber,
        subtotal,
        message: "Order details were not saved — the database is not configured yet.",
      },
      { status: 200 }
    );
  }

  try {
    // Upsert the buyer on phone so repeat customers accumulate rather than duplicate.
    const { data: customer, error: custErr } = await supabase
      .from("customers")
      .upsert(
        {
          full_name: fullName,
          phone,
          email: str(c?.email, 160) || null,
          state: str(c?.state, 80) || null,
          city: str(c?.city, 80) || null,
          ...(consent ? { marketing_consent: true, marketing_consent_at: new Date().toISOString() } : {}),
        },
        { onConflict: "phone" }
      )
      .select("id")
      .single();

    if (custErr) throw custErr;

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_id: customer.id,
        customer_name: fullName,
        customer_phone: phone,
        customer_email: str(c?.email, 160) || null,
        subtotal,
        shipping_fee: 0,
        total: subtotal,
        status: "pending",
        payment_method: "bank_transfer",
        payment_status: "awaiting_payment",
        delivery_state: str(c?.state, 80) || null,
        delivery_city: str(c?.city, 80) || null,
        delivery_street: str(c?.street, 240) || null,
        delivery_landmark: str(c?.landmark, 160) || null,
        notes: str(body.notes, 800) || null,
      })
      .select("id")
      .single();

    if (orderErr) throw orderErr;

    const { error: itemsErr } = await supabase
      .from("order_items")
      .insert(priced.map((i) => ({ ...i, order_id: order.id })));

    if (itemsErr) throw itemsErr;

    return NextResponse.json({ saved: true, orderNumber, subtotal }, { status: 201 });
  } catch (err) {
    console.error("Order save failed:", err);
    return NextResponse.json(
      { saved: false, orderNumber, subtotal, message: "We could not save your order details." },
      { status: 200 }
    );
  }
}
