/**
 * Submit a URL to the Google Indexing API.
 *
 * Required env: GOOGLE_SA_KEY  (service account JSON as a string)
 * Usage: node scripts/index-url.mjs <url>
 *
 * The service account must be added as an OWNER in Google Search Console
 * for wendyherbals.com before this script will work.
 */

import { createSign } from "crypto";

const SA_KEY = JSON.parse(process.env.GOOGLE_SA_KEY ?? "{}");
const URL_TO_INDEX = process.argv[2];

if (!URL_TO_INDEX) {
  console.error("Usage: node scripts/index-url.mjs <url>");
  process.exit(1);
}

if (!SA_KEY.client_email || !SA_KEY.private_key) {
  console.error("GOOGLE_SA_KEY env var is missing or invalid");
  process.exit(1);
}

function createJWT(sa) {
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(
    JSON.stringify({
      iss: sa.client_email,
      scope: "https://www.googleapis.com/auth/indexing",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    })
  ).toString("base64url");

  const sign = createSign("RSA-SHA256");
  sign.update(`${header}.${payload}`);
  const signature = sign.sign(sa.private_key, "base64url");

  return `${header}.${payload}.${signature}`;
}

async function main() {
  const jwt = createJWT(SA_KEY);

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    console.error("Failed to get access token:", JSON.stringify(tokenData));
    process.exit(1);
  }

  const indexRes = await fetch(
    "https://indexing.googleapis.com/v3/urlNotifications:publish",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenData.access_token}`,
      },
      body: JSON.stringify({ url: URL_TO_INDEX, type: "URL_UPDATED" }),
    }
  );

  const indexData = await indexRes.json();

  if (indexRes.ok) {
    console.log(`Indexed: ${URL_TO_INDEX}`);
    console.log(JSON.stringify(indexData));
  } else {
    console.error(`Indexing failed for ${URL_TO_INDEX}:`, JSON.stringify(indexData));
    // Don't exit with error — indexing failure should not block the publish
  }
}

main().catch((err) => {
  console.error(err);
  // Non-fatal: don't block the CI step
});
