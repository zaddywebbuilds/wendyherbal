# Deploying

Target is Vercel. The build is green and the repo is ready; what follows is the
order that avoids a broken first deploy.

---

## Before the first deploy

### 1. Decide: public or private repo?

The repo is currently **public**, and `src/lib/constants.ts` contains Wendy's
bank account details. They are already printed on the price list she hands out,
so this is not a leak — but make it a deliberate choice rather than a discovery.
If the client objects, make the repo private; do not remove the details, since
checkout needs them.

### 2. Log in

```bash
vercel login
```

The CLI is installed but not authenticated — this is the only step that cannot
be done for you.

### 3. Link and deploy a preview

```bash
vercel          # preview deployment, safe
```

Take the preview URL. Do **not** run `vercel --prod` until the checks below pass.

---

## Environment variables

Set these in the Vercel dashboard (Project → Settings → Environment Variables),
or with `vercel env add <NAME> production`.

### Required — the admin is unreachable without them

| Variable | Notes |
| --- | --- |
| `ADMIN_PASSWORD` | What Wendy types to sign in. Give it to her directly, never in the repo. |
| `ADMIN_SECRET` | 32+ random bytes. Signs sessions and encrypts the stored Google token. Changing it logs everyone out and drops her Google connection. |
| `NEXT_PUBLIC_SITE_URL` | The real URL, no trailing slash. Used by sitemap and the OAuth redirect. |

Generate a secret with:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

### Required for buyer capture

| Variable | Notes |
| --- | --- |
| `GOOGLE_CLIENT_ID` | OAuth client (Web application). |
| `GOOGLE_CLIENT_SECRET` | Same client. |
| `NEXT_PUBLIC_GOOGLE_API_KEY` | Only for "use a sheet I already have". Without it that option is disabled with an explanation rather than failing on click. |
| `KV_REST_API_URL` | **Not optional on Vercel.** See below. |
| `KV_REST_API_TOKEN` | Same. |

**Why KV is not optional here.** Her Google refresh token has to survive a
restart, and Vercel's filesystem is read-only and per-invocation. Without a KV
store she can connect her account, see it succeed, and find it silently
disconnected later. Settings detects the absence and warns rather than letting
that happen — but the fix is to add the store. Vercel Marketplace → Upstash
Redis (free tier is ample), then paste the two values.

### Google Cloud, once

The OAuth redirect URI must match the deployed domain **exactly**:

```
https://your-domain.com/api/google/callback
```

Add the preview domain too if you want to test the connect flow there. Also set
the consent screen's publishing status to **In production** — left in "Testing",
refresh tokens expire after 7 days and her orders stop saving without warning.

---

## Before going to production

Search engines are blocked by default (`src/app/robots.ts`). That is
intentional. Do not flip it until:

- [ ] **Medical Disclaimer page exists.** Currently 404s, and it is linked from
      every page footer. This matters most given product names referencing
      medical conditions.
- [ ] Privacy Policy and Terms exist — also linked, also 404.
- [ ] About, Contact, FAQ, Delivery, Returns exist.
- [ ] Products have real photography rather than placeholders.
- [ ] **The catalogue has been reviewed against NAFDAC requirements.** Not done.
- [ ] Food spice prices supplied (they currently show "Price on enquiry").
- [ ] The duplicate "Ulcer Herbs" rows (S/N 52 and 63) resolved with the client.

Then set `NEXT_PUBLIC_ALLOW_INDEXING=true` and:

```bash
vercel --prod
```

---

## Smoke test after any deploy

1. `/` loads, hero and collections render.
2. `/shop` lists 93 products with prices.
3. Add to cart → drawer opens with correct subtotal.
4. `/checkout` → fill details → bank details and the WhatsApp button appear.
5. `/admin` redirects to `/admin/login`.
6. Sign in with `ADMIN_PASSWORD` → dashboard loads.
7. Settings → connect Google → choose a sheet → place a test order → confirm
   the row appears in the sheet.
8. `/robots.txt` says `Disallow: /` until you intend otherwise.

Step 7 is the one worth doing properly — it is the only end-to-end check that
buyer capture actually works in production.
