import { createSign } from "node:crypto";
import { loadConnection } from "./token-store";
import { getConnectedAccessToken } from "./google-oauth";
import {
  ORDERS_TAB, CUSTOMERS_TAB, ORDERS_HEADER, CUSTOMERS_HEADER, normalisePhone,
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

/** Picks the OAuth connection when present, else the service account. */
async function resolveTarget(): Promise<Target | null> {
  const conn = await loadConnection();
  if (conn) {
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
  return Boolean(await loadConnection());
}

export async function activeSpreadsheetUrl(): Promise<string | null> {
  const conn = await loadConnection();
  if (conn) return conn.spreadsheetUrl;
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

async function readRows(t: Target, tab: string, range = "A1:J"): Promise<string[][]> {
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
async function ensureTab(t: Target, tab: string, header: string[]) {
  try {
    const rows = await readRows(t, tab, "A1:J1");
    if (rows.length === 0) await updateRow(t, tab, 1, header);
    return;
  } catch {
    await sheetsFetch(t, ":batchUpdate", {
      method: "POST",
      body: JSON.stringify({ requests: [{ addSheet: { properties: { title: tab } } }] }),
    });
    await updateRow(t, tab, 1, header);
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
 * Appends the order and folds the buyer into the Customers tab, matched on
 * phone number so repeat buyers accumulate instead of duplicating.
 *
 * Nothing here writes past column J, so any column the owner adds to the right
 * of the sheet survives every future order.
 */
export async function recordOrder(o: SheetOrder): Promise<void> {
  const t = await resolveTarget();
  if (!t) throw new Error("No Google Sheets connection is configured.");

  await ensureTab(t, ORDERS_TAB, ORDERS_HEADER);
  await appendRow(t, ORDERS_TAB, [
    o.orderNumber, today(), o.name, o.phone, o.email,
    o.itemsSummary, o.total, o.deliverTo, o.notes, "Awaiting payment",
  ]);

  await ensureTab(t, CUSTOMERS_TAB, CUSTOMERS_HEADER);
  const rows = await readRows(t, CUSTOMERS_TAB);

  const target = normalisePhone(o.phone);
  // Row 1 is the header, so a match at index i lives on sheet row i + 1.
  const idx = rows.findIndex((r, i) => i > 0 && normalisePhone(r[1] ?? "") === target);

  if (idx === -1) {
    await appendRow(t, CUSTOMERS_TAB, [
      o.name, o.phone, o.email, o.city, o.state,
      o.marketingConsent ? "Yes" : "No", 1, o.total, today(), today(),
    ]);
    return;
  }

  const prev = rows[idx];
  const prevOrders = Number(prev[6]) || 0;
  const prevSpent = Number(String(prev[7] ?? "").replace(/[^\d.]/g, "")) || 0;

  await updateRow(t, CUSTOMERS_TAB, idx + 1, [
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
  const t = await resolveTarget();
  if (!t) return [];

  const rows = await readRows(t, CUSTOMERS_TAB);
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
