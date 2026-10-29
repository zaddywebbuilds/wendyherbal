import { FORMAT_NGN, WHATSAPP_URL } from "./constants";
import type { CartItem, Address } from "./types";

/** WH-YYMMDD-XXXX — short enough to quote on WhatsApp, unique enough per day. */
export function generateOrderNumber(): string {
  const d = new Date();
  const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `WH-${ymd}-${rand}`;
}

export interface ReceiptPayload {
  orderNumber: string;
  items: CartItem[];
  subtotal: number;
  address: Address;
  notes?: string;
}

/**
 * The message the customer sends with their transfer receipt. Deliberately
 * lists product names only as the customer already chose them — it adds no
 * health details of its own, and the customer can edit before sending.
 */
export function buildReceiptMessage({ orderNumber, items, subtotal, address, notes }: ReceiptPayload): string {
  const lines = items.map(
    (i) => `• ${i.product.name}${i.size ? ` (${i.size})` : ""} ×${i.quantity} — ${FORMAT_NGN((i.product.price ?? 0) * i.quantity)}`
  );

  return [
    `Hello Wendy Herbals, I have made a bank transfer for my order.`,
    ``,
    `Order: ${orderNumber}`,
    `Name: ${address.full_name}`,
    `Phone: ${address.phone}`,
    ``,
    `Items:`,
    ...lines,
    ``,
    `Total: ${FORMAT_NGN(subtotal)} (excluding way bill)`,
    ``,
    `Deliver to:`,
    `${address.street}, ${address.city}, ${address.state}`,
    address.landmark ? `Landmark: ${address.landmark}` : null,
    notes ? `\nNotes: ${notes}` : null,
    ``,
    `I am attaching my payment receipt.`,
  ]
    .filter((l) => l !== null)
    .join("\n");
}

export const receiptWhatsAppUrl = (payload: ReceiptPayload) =>
  `${WHATSAPP_URL}?text=${encodeURIComponent(buildReceiptMessage(payload))}`;

/** Nigerian states, for the delivery form and shipping zones. */
export const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe",
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
  "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto",
  "Taraba", "Yobe", "Zamfara",
];
