import { loadConnection, saveConnection, type GoogleConnection } from "./token-store";
import { ORDERS_TAB, CUSTOMERS_TAB, ORDERS_HEADER, CUSTOMERS_HEADER } from "./sheet-schema";

/**
 * Three-legged OAuth against the owner's own Google account.
 *
 * Scope is drive.file only — access to files this app creates, and nothing
 * else in her Drive. Google classifies it non-sensitive, so this needs no
 * restricted-scope security review, and the consent screen tells her plainly
 * that the app cannot see her other files.
 */

export const SCOPE = "https://www.googleapis.com/auth/drive.file";
const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SHEETS_API = "https://sheets.googleapis.com/v4/spreadsheets";
const USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

export const isOAuthConfigured = () =>
  Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

export function redirectUri(origin: string) {
  return `${origin.replace(/\/$/, "")}/api/google/callback`;
}

export function buildConsentUrl(origin: string, state: string) {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: redirectUri(origin),
    response_type: "code",
    scope: `${SCOPE} https://www.googleapis.com/auth/userinfo.email`,
    // offline + consent so Google actually returns a refresh token, including
    // on re-connect when it would otherwise omit one.
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state,
  });
  return `${AUTH_URL}?${params}`;
}

/* ------------------------------------------------------------- token flow */

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}

export async function exchangeCode(code: string, origin: string): Promise<TokenResponse> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri(origin),
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) throw new Error(`Token exchange failed (${res.status}): ${await res.text()}`);
  return res.json();
}

let cachedAccess: { value: string; expiresAt: number } | null = null;

async function accessTokenFrom(refreshToken: string): Promise<string> {
  if (cachedAccess && Date.now() < cachedAccess.expiresAt - 60_000) return cachedAccess.value;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) throw new Error(`Token refresh failed (${res.status}): ${await res.text()}`);

  const data = (await res.json()) as TokenResponse;
  cachedAccess = { value: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return data.access_token;
}

export async function getConnectedAccessToken(): Promise<string | null> {
  const conn = await loadConnection();
  if (!conn) return null;
  return accessTokenFrom(conn.refreshToken);
}

export async function fetchUserEmail(accessToken: string): Promise<string> {
  try {
    const res = await fetch(USERINFO_URL, { headers: { Authorization: `Bearer ${accessToken}` } });
    if (!res.ok) return "";
    const data = (await res.json()) as { email?: string };
    return data.email ?? "";
  } catch {
    return "";
  }
}

/* ----------------------------------------------------- spreadsheet create */

/** Creates the order book in her Drive, with both tabs and headers ready. */
export async function createSpreadsheet(accessToken: string): Promise<{ id: string; url: string }> {
  const res = await fetch(SHEETS_API, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      properties: { title: "Wendy Herbals — Orders & Customers" },
      sheets: [
        { properties: { title: ORDERS_TAB, gridProperties: { frozenRowCount: 1 } } },
        { properties: { title: CUSTOMERS_TAB, gridProperties: { frozenRowCount: 1 } } },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Could not create the spreadsheet (${res.status}): ${await res.text()}`);

  const data = (await res.json()) as { spreadsheetId: string; spreadsheetUrl: string };

  await fetch(
    `${SHEETS_API}/${data.spreadsheetId}/values:batchUpdate`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        valueInputOption: "USER_ENTERED",
        data: [
          { range: `${ORDERS_TAB}!A1`, values: [ORDERS_HEADER] },
          { range: `${CUSTOMERS_TAB}!A1`, values: [CUSTOMERS_HEADER] },
        ],
      }),
    }
  );

  return { id: data.spreadsheetId, url: data.spreadsheetUrl };
}

export async function completeConnection(code: string, origin: string): Promise<GoogleConnection> {
  const tokens = await exchangeCode(code, origin);
  if (!tokens.refresh_token) {
    throw new Error(
      "Google did not return a refresh token. Remove this app at myaccount.google.com/permissions and connect again."
    );
  }

  const email = await fetchUserEmail(tokens.access_token);
  const sheet = await createSpreadsheet(tokens.access_token);

  const conn: GoogleConnection = {
    refreshToken: tokens.refresh_token,
    spreadsheetId: sheet.id,
    spreadsheetUrl: sheet.url,
    connectedEmail: email,
    connectedAt: new Date().toISOString(),
  };

  await saveConnection(conn);
  cachedAccess = null;
  return conn;
}

export function resetAccessTokenCache() {
  cachedAccess = null;
}
