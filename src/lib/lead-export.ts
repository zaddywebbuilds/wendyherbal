/**
 * Lead exports.
 *
 * Wendy runs the shop from a phone and follows up on WhatsApp, so a
 * spreadsheet is the wrong shape for the job: WhatsApp only shows people who
 * are in the phone's contacts. The vCard export exists so a download on her
 * phone puts every buyer in her address book, and therefore in WhatsApp,
 * without typing a number.
 *
 * The CSV stays for the desktop view of the same list.
 */

import type { SheetCustomer } from "@/lib/sheets";

/** Who the export covers. Consent is a legal line, not a column to eyeball. */
export type Scope = "all" | "opted-in";

export const scopeCustomers = (customers: SheetCustomer[], scope: Scope) =>
  scope === "opted-in" ? customers.filter((c) => c.consent) : customers;

/* ------------------------------------------------------------------ CSV */

/** Escapes a CSV cell, including the leading-character guard against formula injection. */
function cell(value: unknown): string {
  const s = value === null || value === undefined ? "" : String(value);
  const guarded = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return `"${guarded.replace(/"/g, '""')}"`;
}

const CSV_HEADER = [
  "Name", "Phone", "Email", "City", "State",
  "Marketing consent", "Orders", "Total spent (NGN)", "First order", "Last order",
];

export function toCsv(customers: SheetCustomer[]): string {
  const rows = customers.map((c) => [
    c.name, c.phone, c.email, c.city, c.state,
    c.consent ? "Yes" : "No", c.orders, c.spent, c.firstOrder, c.lastOrder,
  ]);
  // BOM so Excel opens Nigerian names spelt with accents correctly.
  return "\ufeff" + [CSV_HEADER, ...rows].map((r) => r.map(cell).join(",")).join("\r\n");
}

/* --------------------------------------------------------------- vCard */

/** Backslash, semicolon, comma and newline all carry meaning in a vCard value. */
const esc = (s: string) =>
  s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");

/**
 * 0803… and 234803… both become +234803…, which is the form WhatsApp matches
 * against. A local 0-prefixed number saved as-is will not match a Nigerian
 * WhatsApp account.
 */
function e164(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) return null; // Not a reachable number; leave it out.
  if (digits.startsWith("234")) return `+${digits}`;
  if (digits.startsWith("0")) return `+234${digits.slice(1)}`;
  if (digits.length === 10) return `+234${digits}`;
  return `+${digits}`;
}

/**
 * Folds a content line to 75 octets, per RFC 2426.
 *
 * Long notes and long names do overflow it, and a strict importer truncates
 * instead of wrapping, which would quietly cut a contact's name short. Counted
 * in bytes rather than characters so a multi-byte name does not push a line
 * over the limit, and never split mid-character.
 */
function fold(line: string): string {
  const bytes = Buffer.from(line, "utf8");
  if (bytes.length <= 75) return line;

  const out: string[] = [];
  let start = 0;
  let limit = 75; // Continuation lines carry a leading space, so they fit 74.

  while (start < bytes.length) {
    let end = Math.min(start + limit, bytes.length);
    // Walk back off a UTF-8 continuation byte so no character is cut in half.
    while (end > start && end < bytes.length && (bytes[end] & 0xc0) === 0x80) end--;
    out.push(bytes.subarray(start, end).toString("utf8"));
    start = end;
    limit = 74;
  }

  return out.join("\r\n ");
}

/** Whether a number can become a contact at all, so the page can say so up front. */
export const isReachablePhone = (phone: string) => e164(phone) !== null;

/** Splits "Ada Okafor" into the N field. One word stays the given name. */
function nameParts(full: string): { last: string; first: string } {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return { last: "", first: parts[0] ?? "" };
  return { last: parts[parts.length - 1], first: parts.slice(0, -1).join(" ") };
}

export interface VCardResult {
  vcf: string;
  /** How many made it in. */
  included: number;
  /** Left out because the phone number was not usable. */
  skipped: SheetCustomer[];
}

export function toVCard(customers: SheetCustomer[]): VCardResult {
  const cards: string[] = [];
  const skipped: SheetCustomer[] = [];

  for (const c of customers) {
    const tel = e164(c.phone);
    if (!tel) {
      skipped.push(c);
      continue;
    }

    const display = (c.name || "").trim() || c.phone;
    const { last, first } = nameParts(display);

    // The tag goes in the displayed name because that is what is searchable in
    // a phone's contact list and in the WhatsApp chat picker.
    const fn = `${display} (Herbals)`;

    // Kept to ASCII: an older Android contacts importer can mangle a naira sign
    // or a middle dot, and a garbled note is worse than a plain one.
    const note = [
      c.orders ? `${c.orders} order${c.orders === 1 ? "" : "s"}` : null,
      c.spent ? `NGN ${c.spent.toLocaleString("en-NG")}` : null,
      c.firstOrder ? `first order ${c.firstOrder}` : null,
      c.consent ? "agreed to updates" : "orders only - do not send offers",
    ].filter(Boolean).join(" | ");

    const lines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `N:${esc(last)};${esc(first)};;;`,
      `FN:${esc(fn)}`,
      "ORG:Wendy Herbals customer",
      `TEL;TYPE=CELL,VOICE:${tel}`,
    ];
    if (c.email) lines.push(`EMAIL;TYPE=INTERNET:${esc(c.email)}`);
    if (c.city || c.state) lines.push(`ADR;TYPE=HOME:;;;${esc(c.city)};${esc(c.state)};;Nigeria`);
    lines.push(`NOTE:${esc(note)}`);
    lines.push("CATEGORIES:Wendy Herbals");
    lines.push("END:VCARD");

    cards.push(lines.map(fold).join("\r\n"));
  }

  return { vcf: cards.join("\r\n") + (cards.length ? "\r\n" : ""), included: cards.length, skipped };
}

/**
 * The shop's own contact card, for customers to save.
 *
 * This is what makes following up possible at all. A WhatsApp broadcast only
 * reaches people who have the sender's number saved in their phone; everyone
 * else is silently skipped. So the buyer list is only half the job, and this
 * is the other half.
 */
export function businessVCard(opts: { name: string; phone: string; site?: string; tagline: string }): string {
  const tel = e164(opts.phone) ?? opts.phone;
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:;${esc(opts.name)};;;`,
    `FN:${esc(opts.name)}`,
    `ORG:${esc(opts.name)}`,
    `TEL;TYPE=CELL,VOICE:${tel}`,
  ];
  // No invented address: a URL line pointing at a domain that does not resolve
  // is worse than no URL line, because it is saved in the customer's phone.
  if (opts.site) lines.push(`URL:${esc(opts.site)}`);
  lines.push(`NOTE:${esc(opts.tagline)}`, "END:VCARD");
  return lines.map(fold).join("\r\n") + "\r\n";
}
