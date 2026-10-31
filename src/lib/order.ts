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
/**
 * The message the buyer sends to open their order.
 *
 * It used to say a transfer had already been made and a receipt was attached.
 * Neither is true any more: the order is sent first, Wendy quotes the way
 * bill, and payment follows the confirmed total. Saying otherwise would have
 * her chasing receipts that do not exist.
 */
export function buildOrderMessage({ orderNumber, items, subtotal, address, notes }: ReceiptPayload): string {
  const lines = items.map(
    (i) => `• ${i.product.name}${i.size ? ` (${i.size})` : ""} ×${i.quantity} — ${FORMAT_NGN((i.product.price ?? 0) * i.quantity)}`
  );

  return [
    `Hello Wendy Herbals, I would like to place this order.`,
    ``,
    `Order: ${orderNumber}`,
    `Name: ${address.full_name}`,
    `Phone: ${address.phone}`,
    ``,
    `Items:`,
    ...lines,
    ``,
    `Products subtotal: ${FORMAT_NGN(subtotal)}`,
    `(The way bill is not included in this figure.)`,
    ``,
    `Deliver to:`,
    `${address.street}, ${address.city}, ${address.state}`,
    address.landmark ? `Landmark: ${address.landmark}` : null,
    notes ? `\nNotes: ${notes}` : null,
    ``,
    `Please confirm the way bill for my area and my full total, and I will transfer it.`,
  ]
    .filter((l) => l !== null)
    .join("\n");
}

export const orderWhatsAppUrl = (payload: ReceiptPayload) =>
  `${WHATSAPP_URL}?text=${encodeURIComponent(buildOrderMessage(payload))}`;

/** Nigerian states, for the delivery form and shipping zones. */
export const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe",
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
  "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto",
  "Taraba", "Yobe", "Zamfara",
];
