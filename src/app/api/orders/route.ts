import { NextResponse } from "next/server";
import { PRODUCTS } from "@/lib/products";
import { isSheetsConfigured, recordOrder } from "@/lib/sheets";

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
    priced.push({ name: product.name, qty, unitPrice: product.price, size: str(raw?.size, 40) });
  }

  const subtotal = priced.reduce((s, i) => s + i.unitPrice * i.qty, 0);

  if (!isSheetsConfigured()) {
    // Be honest rather than reporting a save that did not happen. The WhatsApp
    // handoff still carries the full order.
    return NextResponse.json(
      {
        saved: false,
        orderNumber,
        subtotal,
        message: "Order details were not saved — the order sheet is not connected yet.",
      },
      { status: 200 }
    );
  }

  try {
    await recordOrder({
      orderNumber,
      name: fullName,
      phone,
      email: str(c?.email, 160),
      itemsSummary: priced
        .map((i) => `${i.name}${i.size ? ` (${i.size})` : ""} x${i.qty}`)
        .join("; "),
      total: subtotal,
      deliverTo: [str(c?.street, 240), str(c?.city, 80), str(c?.state, 80)]
        .filter(Boolean)
        .join(", ") + (str(c?.landmark, 160) ? ` (near ${str(c?.landmark, 160)})` : ""),
      notes: str(body.notes, 800),
      marketingConsent: body.marketingConsent === true,
      city: str(c?.city, 80),
      state: str(c?.state, 80),
    });

    return NextResponse.json({ saved: true, orderNumber, subtotal }, { status: 201 });
  } catch (err) {
    console.error("Order save failed:", err);
    return NextResponse.json(
      { saved: false, orderNumber, subtotal, message: "We could not save your order details." },
      { status: 200 }
    );
  }
}
