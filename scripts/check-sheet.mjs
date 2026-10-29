/**
 * Verifies the Google Sheets connection before handing the sheet to Wendy.
 *
 *   npm run check:sheet
 *
 * Catches the two things people actually get wrong: a malformed private key,
 * and forgetting to share the sheet with the service account.
 */
import { createSign } from "node:crypto";

const { GOOGLE_SHEETS_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY } = process.env;

const fail = (msg, hint) => {
  console.error(`\n  ✗ ${msg}`);
  if (hint) console.error(`    ${hint}`);
  process.exit(1);
};

const missing = [
  ["GOOGLE_SHEETS_ID", GOOGLE_SHEETS_ID],
  ["GOOGLE_SERVICE_ACCOUNT_EMAIL", GOOGLE_SERVICE_ACCOUNT_EMAIL],
  ["GOOGLE_PRIVATE_KEY", GOOGLE_PRIVATE_KEY],
].filter(([, v]) => !v).map(([k]) => k);

if (missing.length) {
  fail(`Missing: ${missing.join(", ")}`, "Copy .env.example to .env.local and fill it in.");
}

const b64url = (i) =>
  Buffer.from(i).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

console.log(`\n  Sheet    ${GOOGLE_SHEETS_ID}`);
console.log(`  Account  ${GOOGLE_SERVICE_ACCOUNT_EMAIL}`);

// --- 1. mint a token -------------------------------------------------------
let token;
try {
  const iat = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = b64url(JSON.stringify({
    iss: GOOGLE_SERVICE_ACCOUNT_EMAIL,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    iat, exp: iat + 3600,
  }));
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claims}`);
  const jwt = `${header}.${claims}.${b64url(signer.sign(GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n")))}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  if (!res.ok) fail(`Google rejected the credentials (${res.status}).`, await res.text());
  ({ access_token: token } = await res.json());
  console.log("  ✓ Credentials accepted");
} catch (err) {
  fail("Could not sign the token.", `${err.message}\n    Check GOOGLE_PRIVATE_KEY is quoted and keeps its \\n sequences.`);
}

// --- 2. read the sheet -----------------------------------------------------
const res = await fetch(
  `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_ID}?fields=properties.title,sheets.properties.title`,
  { headers: { Authorization: `Bearer ${token}` } }
);

if (res.status === 403) {
  fail(
    "Credentials work, but this service account cannot open the sheet.",
    `Open the sheet, click Share, and add:\n    ${GOOGLE_SERVICE_ACCOUNT_EMAIL}\n    as an Editor. This is the step people miss.`
  );
}
if (res.status === 404) {
  fail("No sheet with that ID.", "GOOGLE_SHEETS_ID is the part between /d/ and /edit in the URL.");
}
if (!res.ok) fail(`Sheets API returned ${res.status}.`, await res.text());

const info = await res.json();
const tabs = (info.sheets ?? []).map((s) => s.properties.title);

console.log(`  ✓ Opened "${info.properties.title}"`);
console.log(`    Tabs: ${tabs.join(", ") || "(none yet)"}`);

for (const t of ["Orders", "Customers"]) {
  if (!tabs.includes(t)) console.log(`    · "${t}" will be created on the first order`);
}

console.log("\n  Ready. Orders will now be written to this sheet.\n");
