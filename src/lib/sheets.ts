import { createSign } from "node:crypto";
import { loadConnection } from "./token-store";
import { getConnectedAccessToken } from "./google-oauth";
import {
  ORDERS_TAB, CUSTOMERS_TAB, ORDERS_HEADER, CUSTOMERS_HEADER,
  ORDERS_RANGE, CUSTOMERS_RANGE, ORDER_COL, CUSTOMER_COL,
  normalisePhone, parseMoney, lagosStamp,
} from "./sheet-schema";

export { ORDERS_TAB, CUSTOMERS_TAB, ORDERS_HEADER, CUSTOMERS_HEADER };

/**
 * Reads and writes the order book.
 *
 * Two ways in, checked in this order:
 *   1. An OAuth connection the owner made herself — the sheet lives in her
 *      own Drive and she owns it.
 *   2. A service account with a sheet shared to it, for setups wired by hand.
 *
 * The JWT is hand-rolled rather than pulling in `googleapis`: that package is
 * tens of megabytes for what amounts to a few REST calls, which matters for
 * serverless cold starts.
 */

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const API = "https://sheets.googleapis.com/v4/spreadsheets";

export const isServiceAccountConfigured = () =>
  Boolean(
    process.env.GOOGLE_SHEETS_ID &&
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    process.env.GOOGLE_PRIVATE_KEY
  );

/* --------------------------------------------------- service-account auth */

let cachedSaToken: { value: string; expiresAt: number } | null = null;

const b64url = (input: Buffer | string) =>
  Buffer.from(input).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

async function serviceAccountToken(): Promise<string> {
  if (cachedSaToken && Date.now() < cachedSaToken.expiresAt - 60_000) return cachedSaToken.value;

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!;
  // Env vars carry the key with literal \n sequences; restore real newlines.
  const key = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n");

  const iat = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = b64url(JSON.stringify({
    iss: email,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: TOKEN_URL,
    iat,
    exp: iat + 3600,
  }));

  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claims}`);
  const jwt = `${header}.${claims}.${b64url(signer.sign(key))}`;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  if (!res.ok) throw new Error(`Google token request failed (${res.status}): ${await res.text()}`);

  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedSaToken = { value: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return cachedSaToken.value;
}

/* ------------------------------------------------------------- resolution */

interface Target { token: string; spreadsheetId: string }

/**
 * Picks the OAuth connection when one is linked to a sheet, else the service
 * account. A connection without a chosen sheet is not a target: orders must
 * never land somewhere she did not pick.
 */
async function resolveTarget(): Promise<Target | null> {
  const conn = await loadConnection();
  if (conn?.spreadsheetId) {
    const token = await getConnectedAccessToken();
    if (token) return { token, spreadsheetId: conn.spreadsheetId };
  }
  if (isServiceAccountConfigured()) {
    return { token: await serviceAccountToken(), spreadsheetId: process.env.GOOGLE_SHEETS_ID! };
  }
  return null;
}

export async function isSheetsReady(): Promise<boolean> {
  if (isServiceAccountConfigured()) return true;
  const conn = await loadConnection();
  return Boolean(conn?.spreadsheetId);
}

export async function activeSpreadsheetUrl(): Promise<string | null> {
  const conn = await loadConnection();
  if (conn?.spreadsheetUrl) return conn.spreadsheetUrl;
  if (process.env.GOOGLE_SHEETS_ID) {
    return `https://docs.google.com/spreadsheets/d/${process.env.GOOGLE_SHEETS_ID}/edit`;
  }
  return null;
}

async function sheetsFetch(target: Target, path: string, init?: RequestInit) {
  const res = await fetch(`${API}/${target.spreadsheetId}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${target.token}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Google Sheets ${init?.method ?? "GET"} ${path} failed (${res.status}): ${await res.text()}`);
  }
  return res.json();
}

/* ------------------------------------------------------------ primitives */

/**
 * `range` must cover the whole header. A short range returns undefined for the
 * missing cells, which reads as empty data rather than failing, so callers
 * pass ORDERS_RANGE / CUSTOMERS_RANGE instead of a literal.
 */
async function readRows(t: Target, tab: string, range: string): Promise<string[][]> {
  const data = (await sheetsFetch(t, `/values/${encodeURIComponent(`${tab}!${range}`)}`)) as {
    values?: string[][];
  };
  return data.values ?? [];
}

async function appendRow(t: Target, tab: string, row: (string | number)[]) {
  await sheetsFetch(
    t,
    `/values/${encodeURIComponent(`${tab}!A1`)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    { method: "POST", body: JSON.stringify({ values: [row] }) }
  );
}

async function updateRow(t: Target, tab: string, rowNumber: number, row: (string | number)[]) {
  await sheetsFetch(
    t,
    `/values/${encodeURIComponent(`${tab}!A${rowNumber}`)}?valueInputOption=USER_ENTERED`,
    { method: "PUT", body: JSON.stringify({ values: [row] }) }
  );
}

/** Adds the tab and header row when they are not there yet. */
async function ensureTab(t: Target, tab: string, header: readonly string[]) {
  try {
    const rows = await readRows(t, tab, "A1:A1");
    if (rows.length === 0) await updateRow(t, tab, 1, [...header]);
    return;
  } catch {
    await sheetsFetch(t, ":batchUpdate", {
      method: "POST",
      body: JSON.stringify({ requests: [{ addSheet: { properties: { title: tab } } }] }),
    });
    await updateRow(t, tab, 1, [...header]);
  }
}

/* ------------------------------------------------------------- high level */

export interface SheetOrder {
  orderNumber: string;
  name: string;
  phone: string;
  whatsappPhone: string;
  smsPhone: string;
  birthday: string;
  email: string;
  itemsSummary: string;
  total: number;
  deliverTo: string;
  notes: string;
  marketingConsent: boolean;
  city: string;
  state: string;
}

/** Date only, for the customer columns where a time adds nothing. */
const today = () => new Date().toISOString().slice(0, 10);

/**
 * Appends the order and folds the buyer into the Customers tab, matched on
 * phone number so repeat buyers accumulate instead of duplicating.
 *
 * The update path reads the existing row before rewriting it, so the read has
 * to span the full header. It once did not: lifetime spend and first-order
 * date sit past the old range, came back undefined, and were overwritten with
 * this order's total and today's date on every repeat purchase.
 */
export async function recordOrder(o: SheetOrder): Promise<void> {
  const t = await resolveTarget();
  if (!t) throw new Error("No Google Sheets connection is configured.");

  await ensureTab(t, ORDERS_TAB, ORDERS_HEADER);

  const orderRow: (string | number)[] = [];
  orderRow[ORDER_COL.orderNumber] = o.orderNumber;
  // Minute precision here, unlike the customer columns: the storefront
  // activity feed says how long ago an order came in.
  orderRow[ORDER_COL.date] = lagosStamp();
  orderRow[ORDER_COL.name] = o.name;
  orderRow[ORDER_COL.phone] = o.phone;
  orderRow[ORDER_COL.whatsapp] = o.whatsappPhone;
  orderRow[ORDER_COL.email] = o.email;
  orderRow[ORDER_COL.items] = o.itemsSummary;
  orderRow[ORDER_COL.total] = o.total;
  orderRow[ORDER_COL.deliverTo] = o.deliverTo;
  orderRow[ORDER_COL.notes] = o.notes;
  orderRow[ORDER_COL.status] = "Awaiting payment";
  await appendRow(t, ORDERS_TAB, orderRow);

  await ensureTab(t, CUSTOMERS_TAB, CUSTOMERS_HEADER);
  const rows = await readRows(t, CUSTOMERS_TAB, CUSTOMERS_RANGE);

  const target = normalisePhone(o.phone);
  // Row 1 is the header, so a match at index i lives on sheet row i + 1.
  const idx = rows.findIndex(
    (r, i) => i > 0 && normalisePhone(r[CUSTOMER_COL.phone] ?? "") === target
  );

  const prev = idx === -1 ? [] : rows[idx];
  const keep = (col: number, fresh: string) => fresh || prev[col] || "";

  const row: (string | number)[] = [];
  row[CUSTOMER_COL.name] = keep(CUSTOMER_COL.name, o.name);
  row[CUSTOMER_COL.phone] = o.phone;
  row[CUSTOMER_COL.whatsapp] = keep(CUSTOMER_COL.whatsapp, o.whatsappPhone);
  row[CUSTOMER_COL.sms] = keep(CUSTOMER_COL.sms, o.smsPhone);
  row[CUSTOMER_COL.birthday] = keep(CUSTOMER_COL.birthday, o.birthday);
  row[CUSTOMER_COL.email] = keep(CUSTOMER_COL.email, o.email);
  row[CUSTOMER_COL.city] = keep(CUSTOMER_COL.city, o.city);
  row[CUSTOMER_COL.state] = keep(CUSTOMER_COL.state, o.state);
  // Consent is only ever upgraded here; withdrawing it is done in the sheet.
  row[CUSTOMER_COL.consent] = o.marketingConsent
    ? "Yes"
    : (prev[CUSTOMER_COL.consent] || "No");
  row[CUSTOMER_COL.orders] = (Number(prev[CUSTOMER_COL.orders]) || 0) + 1;
  row[CUSTOMER_COL.spent] = parseMoney(prev[CUSTOMER_COL.spent]) + o.total;
  row[CUSTOMER_COL.firstOrder] = prev[CUSTOMER_COL.firstOrder] || today();
  row[CUSTOMER_COL.lastOrder] = today();

  if (idx === -1) await appendRow(t, CUSTOMERS_TAB, row);
  else await updateRow(t, CUSTOMERS_TAB, idx + 1, row);
}

export interface SheetOrderRow {
  /**
   * 1-based row number in the sheet. Carried so a future status update can
   * target the right row without re-matching on the order number, and so the
   * UI has a stable key even if two orders share a number.
   */
  row: number;
  orderNumber: string;
  date: string;
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  items: string;
  total: number;
  deliverTo: string;
  notes: string;
  status: string;
}

/**
 * Reads the Orders tab, newest first.
 *
 * The owner edits the Status column by hand, so whatever she typed is passed
 * through untouched rather than being coerced into a fixed set. Rows without
 * an order number are skipped: those are blank rows or notes she has added.
 */
export async function listOrders(): Promise<SheetOrderRow[]> {
  const t = await resolveTarget();
  if (!t) return [];

  const rows = await readRows(t, ORDERS_TAB, ORDERS_RANGE);
  return rows
    .map((r, i) => ({ r, row: i + 1 }))
    .slice(1)
    .filter(({ r }) => (r[ORDER_COL.orderNumber] ?? "").trim())
    .map(({ r, row }) => ({
      row,
      orderNumber: r[ORDER_COL.orderNumber] ?? "",
      date: r[ORDER_COL.date] ?? "",
      name: r[ORDER_COL.name] ?? "",
      phone: r[ORDER_COL.phone] ?? "",
      whatsapp: r[ORDER_COL.whatsapp] ?? "",
      email: r[ORDER_COL.email] ?? "",
      items: r[ORDER_COL.items] ?? "",
      total: parseMoney(r[ORDER_COL.total]),
      deliverTo: r[ORDER_COL.deliverTo] ?? "",
      notes: r[ORDER_COL.notes] ?? "",
      status: (r[ORDER_COL.status] ?? "").trim(),
    }))
    .reverse();
}

export interface SheetCustomer {
  name: string; phone: string; whatsapp: string; sms: string; birthday: string;
  email: string; city: string; state: string;
  consent: boolean; orders: number; spent: number; firstOrder: string; lastOrder: string;
}

export async function listCustomers(): Promise<SheetCustomer[]> {
  const t = await resolveTarget();
  if (!t) return [];

  const rows = await readRows(t, CUSTOMERS_TAB, CUSTOMERS_RANGE);
  return rows.slice(1)
    .filter((r) => (r[CUSTOMER_COL.phone] ?? "").trim())
    .map((r) => ({
      name: r[CUSTOMER_COL.name] ?? "",
      phone: r[CUSTOMER_COL.phone] ?? "",
      whatsapp: r[CUSTOMER_COL.whatsapp] ?? "",
      sms: r[CUSTOMER_COL.sms] ?? "",
      birthday: r[CUSTOMER_COL.birthday] ?? "",
      email: r[CUSTOMER_COL.email] ?? "",
      city: r[CUSTOMER_COL.city] ?? "",
      state: r[CUSTOMER_COL.state] ?? "",
      consent: /^y/i.test(r[CUSTOMER_COL.consent] ?? ""),
      orders: Number(r[CUSTOMER_COL.orders]) || 0,
      spent: parseMoney(r[CUSTOMER_COL.spent]),
      firstOrder: r[CUSTOMER_COL.firstOrder] ?? "",
      lastOrder: r[CUSTOMER_COL.lastOrder] ?? "",
    }))
    .reverse();
}
