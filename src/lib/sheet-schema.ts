/**
 * Tab names, header rows and column positions, shared by the OAuth and
 * service-account paths.
 *
 * Read and write both go through the named indices below rather than literal
 * numbers. Three columns were once inserted into the middle of these headers
 * without the readers being updated, which silently scrambled every field
 * after the insertion point and destroyed repeat-buyer history. Adding a
 * column here now moves the index with it, and the read range widens on its
 * own, so that cannot happen the same way twice.
 *
 * Append new columns at the END unless you also mean to rewrite existing
 * sheets: these indices describe spreadsheets already out there holding real
 * customer data.
 */

export const ORDERS_TAB = "Orders";
export const CUSTOMERS_TAB = "Customers";

export const ORDERS_HEADER = [
  "Order #", "Date", "Name", "Phone", "WhatsApp", "Email",
  "Items", "Total (NGN)", "Deliver to", "Notes", "Status",
] as const;

export const CUSTOMERS_HEADER = [
  "Name", "Phone", "WhatsApp", "SMS Number", "Birthday", "Email", "City", "State",
  "Updates OK?", "Orders", "Total spent (NGN)", "First order", "Last order",
] as const;

/** Zero-based positions in ORDERS_HEADER. */
export const ORDER_COL = {
  orderNumber: 0, date: 1, name: 2, phone: 3, whatsapp: 4, email: 5,
  items: 6, total: 7, deliverTo: 8, notes: 9, status: 10,
} as const;

/** Zero-based positions in CUSTOMERS_HEADER. */
export const CUSTOMER_COL = {
  name: 0, phone: 1, whatsapp: 2, sms: 3, birthday: 4, email: 5, city: 6, state: 7,
  consent: 8, orders: 9, spent: 10, firstOrder: 11, lastOrder: 12,
} as const;

/** 1 -> A, 26 -> Z, 27 -> AA. */
function columnLetter(n: number): string {
  let out = "";
  while (n > 0) {
    const rem = (n - 1) % 26;
    out = String.fromCharCode(65 + rem) + out;
    n = Math.floor((n - 1) / 26);
  }
  return out;
}

/**
 * The A1 range that covers exactly this header, so a read can never stop
 * short of the last column. Reading too narrow is the failure that cost us:
 * truncated cells come back undefined and look like empty data rather than
 * an error.
 */
export const rangeFor = (header: readonly string[]) => `A1:${columnLetter(header.length)}`;

export const ORDERS_RANGE = rangeFor(ORDERS_HEADER);
export const CUSTOMERS_RANGE = rangeFor(CUSTOMERS_HEADER);

/** Reads a money cell written as "15,000" or "₦15,000". */
export const parseMoney = (v: unknown): number =>
  Number(String(v ?? "").replace(/[^\d.]/g, "")) || 0;

/** Normalises 0803… and +234 803… to one comparable form. */
export const normalisePhone = (s: string) =>
  s.replace(/\D/g, "").replace(/^0/, "234");
