import { createSign } from "node:crypto";

/**
 * Minimal Google Sheets client.
 *
 * Hand-rolled JWT rather than the `googleapis` package: that dependency is tens
 * of megabytes and this needs three REST calls, which matters for serverless
 * cold starts.
 *
 * The spreadsheet is the owner's working copy — she opens it on her phone,
 * taps a number to call or WhatsApp, and can add her own columns. Nothing here
 * writes past column J, so anything she adds to the right is left alone.
 */

const SCOPE = "https://www.googleapis.com/auth/spreadsheets";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const API = "https://sheets.googleapis.com/v4/spreadsheets";

export const ORDERS_TAB = "Orders";
export const CUSTOMERS_TAB = "Customers";

export const ORDERS_HEADER = [
  "Order #", "Date", "Name", "Phone", "Email",
  "Items", "Total (NGN)", "Deliver to", "Notes", "Status",
];

export const CUSTOMERS_HEADER = [
  "Name", "Phone", "Email", "City", "State",
  "Updates OK?", "Orders", "Total spent (NGN)", "First order", "Last order",
];

export const isSheetsConfigured = () =>
  Boolean(
    process.env.GOOGLE_SHEETS_ID &&
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    process.env.GOOGLE_PRIVATE_KEY
  );

/* ------------------------------------------------------------------ auth */

let cachedToken: { value: string; expiresAt: number } | null = null;

const b64url = (input: Buffer | string) =>
  Buffer.from(input).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

async function getAccessToken(): Promise<string> {
  // Re-use until a minute before expiry.
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) return cachedToken.value;

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!;
  // Env vars carry the key with literal \n sequences; restore real newlines.
  const key = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n");

  const iat = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = b64url(JSON.stringify({
    iss: email, scope: SCOPE, aud: TOKEN_URL, iat, exp: iat + 3600,
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

  if (!res.ok) {
    throw new Error(`Google token request failed (${res.status}): ${await res.text()}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { value: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return cachedToken.value;
}

async function sheetsFetch(path: string, init?: RequestInit) {
  const token = await getAccessToken();
  const res = await fetch(`${API}/${process.env.GOOGLE_SHEETS_ID}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
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

/* ----------------------------------------------------------------- reads */

export async function readRows(tab: string, range = "A1:J"): Promise<string[][]> {
  const data = (await sheetsFetch(
    `/values/${encodeURIComponent(`${tab}!${range}`)}`
  )) as { values?: string[][] };
  return data.values ?? [];
}

/* ---------------------------------------------------------------- writes */

async function appendRow(tab: string, row: (string | number)[]) {
  await sheetsFetch(
    `/values/${encodeURIComponent(`${tab}!A1`)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    { method: "POST", body: JSON.stringify({ values: [row] }) }
  );
}

async function updateRow(tab: string, rowNumber: number, row: (string | number)[]) {
  await sheetsFetch(
    `/values/${encodeURIComponent(`${tab}!A${rowNumber}`)}?valueInputOption=USER_ENTERED`,
    { method: "PUT", body: JSON.stringify({ values: [row] }) }
  );
}

/** Creates the tab and its header row if they are not there yet. */
async function ensureTab(tab: string, header: string[]) {
  try {
    const rows = await readRows(tab, "A1:J1");
    if (rows.length === 0) await updateRow(tab, 1, header);
    return;
  } catch {
    // Range failing usually means the tab itself is missing — add it, then header.
    await sheetsFetch(":batchUpdate", {
      method: "POST",
      body: JSON.stringify({ requests: [{ addSheet: { properties: { title: tab } } }] }),
    });
    await updateRow(tab, 1, header);
  }
}

/* ------------------------------------------------------------- high level */

export interface SheetOrder {
  orderNumber: string;
  name: string;
  phone: string;
  email: string;
  itemsSummary: string;
  total: number;
  deliverTo: string;
  notes: string;
  marketingConsent: boolean;
  city: string;
  state: string;
}

const today = () => new Date().toISOString().slice(0, 10);

/**
 * Appends the order and folds the buyer into the Customers tab, matching on
 * phone number so repeat buyers accumulate instead of duplicating.
 */
export async function recordOrder(o: SheetOrder): Promise<void> {
  await ensureTab(ORDERS_TAB, ORDERS_HEADER);
  await appendRow(ORDERS_TAB, [
    o.orderNumber, today(), o.name, o.phone, o.email,
    o.itemsSummary, o.total, o.deliverTo, o.notes, "Awaiting payment",
  ]);

  await ensureTab(CUSTOMERS_TAB, CUSTOMERS_HEADER);
  const rows = await readRows(CUSTOMERS_TAB);

  const digits = (s: string) => s.replace(/\D/g, "").replace(/^0/, "234");
  const target = digits(o.phone);
  // Row 1 is the header, so a match at index i lives on sheet row i + 1.
  const idx = rows.findIndex((r, i) => i > 0 && digits(r[1] ?? "") === target);

  if (idx === -1) {
    await appendRow(CUSTOMERS_TAB, [
      o.name, o.phone, o.email, o.city, o.state,
      o.marketingConsent ? "Yes" : "No", 1, o.total, today(), today(),
    ]);
    return;
  }

  const prev = rows[idx];
  const prevOrders = Number(prev[6]) || 0;
  const prevSpent = Number(String(prev[7] ?? "").replace(/[^\d.]/g, "")) || 0;

  await updateRow(CUSTOMERS_TAB, idx + 1, [
    o.name || prev[0], o.phone, o.email || prev[2] || "", o.city || prev[3] || "", o.state || prev[4] || "",
    // Consent is only ever upgraded here; withdrawing it is done in the sheet.
    o.marketingConsent ? "Yes" : (prev[5] || "No"),
    prevOrders + 1,
    prevSpent + o.total,
    prev[8] || today(),
    today(),
  ]);
}

export interface SheetCustomer {
  name: string; phone: string; email: string; city: string; state: string;
  consent: boolean; orders: number; spent: number; firstOrder: string; lastOrder: string;
}

export async function listCustomers(): Promise<SheetCustomer[]> {
  const rows = await readRows(CUSTOMERS_TAB);
  return rows.slice(1)
    .filter((r) => (r[1] ?? "").trim())
    .map((r) => ({
      name: r[0] ?? "",
      phone: r[1] ?? "",
      email: r[2] ?? "",
      city: r[3] ?? "",
      state: r[4] ?? "",
      consent: /^y/i.test(r[5] ?? ""),
      orders: Number(r[6]) || 0,
      spent: Number(String(r[7] ?? "").replace(/[^\d.]/g, "")) || 0,
      firstOrder: r[8] ?? "",
      lastOrder: r[9] ?? "",
    }))
    .reverse();
}

export const spreadsheetUrl = () =>
  `https://docs.google.com/spreadsheets/d/${process.env.GOOGLE_SHEETS_ID}/edit`;
