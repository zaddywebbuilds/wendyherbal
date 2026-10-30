# Handoff — Wendy Herbals

Everything needed to pick this up cold. Read this before touching code; it
records not just what exists but **why**, so decisions already settled are not
relitigated.

**Client:** Wendy Herbals, a Nigerian herbal wellness and food-spice business.
**Repo:** `github.com/zaddywebbuilds/wendyherbal`
**Owner is not technical.** That constraint drove most of the architecture below.

---

## ▶ START HERE — resume at deployment

Last session stopped mid-deploy. Everything is committed and pushed; the build
is green (114 routes). Nothing is half-finished in the code.

**What blocked it:** the Vercel CLI (v63.1.0) is installed but **not
authenticated** — `vercel whoami` returns `Not authorized`, and there is no auth
file on disk. The Vercel MCP connector also needs authorising via `/mcp`. Both
are sign-ins only the account holder can perform.

**To resume, in order:**

```bash
vercel login          # the blocker — only a human can do this
vercel                # preview deploy, NOT --prod
```

Then follow [DEPLOY.md](DEPLOY.md) for environment variables. Two of them are
traps worth reading about before Wendy ever connects her account:

- **A KV store is not optional on Vercel.** Without Upstash Redis attached, she
  connects Google, sees it succeed, and is silently disconnected on the next
  cold start — orders then stop saving with no error anywhere.
- **The OAuth consent screen must be "In production".** Left in "Testing",
  Google expires refresh tokens after 7 days. Same silent failure, slower fuse.

**Admin credentials:** generate fresh ones and set them in Vercel's env vars.
Never commit them — this repo is public.

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

`ADMIN_PASSWORD` is what Wendy types to sign in, so make it dictatable over the
phone (word-based beats random characters here). `ADMIN_SECRET` signs sessions
and encrypts her stored Google token — changing it later logs everyone out and
drops the connection.

**Deliberate choice already made:** search engines are blocked
(`src/app/robots.ts` returns `Disallow: /`, verified). Do not lift it for a
preview. The gate is the pre-launch checklist in DEPLOY.md — legal pages,
photography, NAFDAC review. Flip `NEXT_PUBLIC_ALLOW_INDEXING=true` only when
those are genuinely done.

**Decide deliberately before deploying:** the repo is public and Wendy's bank
details are in `src/lib/constants.ts`. They are already on the price list she
distributes, so this is not a leak — but make it a choice, not a discovery. If
the client objects, make the repo private; do not strip the details, checkout
needs them.

Product photography is now **partly done**: 69 of 93 products carry an image.
Read Task 2 before touching it: what the client supplied is not what that
section originally anticipated, and two questions are still open with her.

---

## Status at a glance

| Area | State |
| --- | --- |
| Homepage | ✅ Done — matches the client's approved mockup |
| Shop + filters | ✅ Done — 93 products, real prices |
| Product pages | ✅ Done — 93 prerendered |
| Cart | ✅ Done — persistent, drawer |
| Checkout | ✅ Done — bank transfer → WhatsApp receipt |
| Buyer capture | ✅ Done — writes to her Google Sheet |
| Admin login | ✅ Done — password gate |
| Admin dashboard | ✅ Shell + live KPIs. Reads real data; shows zeros honestly |
| Admin Customers | ✅ Done — list, WhatsApp links, CSV export |
| Admin Settings | ✅ Done — Google connect + sheet chooser |
| SEO | ✅ robots (blocking) + sitemap, 100 URLs |
| **Deployment** | ⏸ **Resume here.** Blocked on `vercel login` |
| Product photos | ◐ 69 of 93 wired. Client renders, not photos. Read Task 2 |
| Admin CRUD screens | ❌ Not built — sidebar links 404 |
| Content pages | ❌ Not built — About/Contact/FAQ/legal 404 |

Build is green. `npm run build` passes, 114 routes. Working tree clean and in
sync with `origin/main`.

---

## Quick start

```bash
npm install
cp .env.example .env.local   # fill in ADMIN_PASSWORD + ADMIN_SECRET at minimum
npm run dev
```

Storefront `/` · Admin `/admin` (needs the password you set).

**Without any Google config the site still fully works.** Checkout completes and
the order reaches WhatsApp intact; the app simply reports that nothing was saved
rather than pretending. That honesty is deliberate — see Principles.

---

## Principles already settled

These were decided with the client. Changing them needs a conversation, not a
commit.

**1. Never invent data.** No fake reviews, no placeholder prices, no sample
orders, no illustrative dashboard numbers. The approved mockup showed star
ratings and ₦420,000 prices — both fabricated, both deliberately omitted. The
dashboard shows real zeros with empty states because the shop has taken no
orders. If a figure cannot be derived from real data, it is not displayed.

**2. Never claim a save that did not happen.** Every storage path reports
truthfully when it is unconfigured. A silent failure would lose her customers.

**3. Never borrow a product image.** Products without a photo render a branded
"photo pending" placeholder rather than a lifestyle shot that happens to be
nearby. A wrong image on a medical product is worse than no image.

**4. No medical claims.** Product names reference conditions because the source
catalogue names them that way. The site adds no efficacy claims, no
testimonials, no regulatory badges. Disclaimer in footer and on product pages.
`nafdac_status` is tracked per product. **Review against NAFDAC requirements
before commercial launch** — this has not been done.

**5. Orders go to exactly one sheet.** The owner's explicit worry was leads
scattering across files. Enforced, not hoped for: until she picks a destination,
nothing is written at all.

---

## Architecture decisions and why

### Google Sheets, not a database
She is not technical. A dashboard is another thing to learn; a spreadsheet is
something she already opens on her phone, where tapping a number calls or
WhatsApps the buyer. `supabase/schema.sql` is kept as the migration path for
when the shop outgrows this or needs customer logins.

### OAuth button, not a service account
Earlier versions used a service account with a hand-shared sheet. The client
wanted her to click and connect. Both paths still work; an OAuth connection
takes precedence.

### `drive.file` scope only
Not `spreadsheets`. `drive.file` is **non-sensitive** in Google's
classification, so it needs no restricted-scope security review. It grants
access only to files this app created *or that she explicitly picked*.

This is also why "use a sheet I already have" uses the **Google Picker** rather
than a pasted link — under `drive.file` a pasted URL genuinely cannot be opened.
The Picker *is* the access-granting mechanism. Do not "simplify" this to a text
field; it will not work.

### Hand-rolled JWT, not `googleapis`
That package is tens of megabytes for what amounts to a few REST calls. Matters
for serverless cold starts. See `src/lib/sheets.ts`.

### Admin auth was not optional
It shipped *with* the OAuth button because an unauthenticated Settings page lets
anyone repoint the shop's order book at their own Google account. The gate fails
closed: no `ADMIN_PASSWORD` set means the dashboard is unreachable, not open.

---

## The catalogue

`src/lib/products.ts` — **93 products**, all real.

- **81 herbal / body-care**, transcribed verbatim from the client's three-page
  price list (WhatsApp, 28 Oct 2026). Source S/N numbering preserved as
  `WH-001`…`WH-081`. Prices ₦800–₦25,000.
- **12 food spices**, `price: null` — they are **not** on the supplied price
  list. They render "Price on enquiry" rather than a made-up figure. Get these
  prices from the client and it is a one-line change each.

**Known duplicate:** S/N 52 and S/N 63 are both "Ulcer Herbs" at ₦15,000. Both
rows are kept and recorded in `DUPLICATE_AUDIT`. The client must decide whether
they are duplicates, different sizes, or distinct products.

**Stock is not tracked.** `stock_count: 0` means "not counted yet", not "sold
out". `getLowStock()` ignores zero so the dashboard raises no false alarms. When
real stock is known, set the numbers and low-stock reporting starts working.

**Note:** the original brief said "PCOS does not include balm", but the client's
own price list reads "PCOS Herbs with Balm". The price list won — it is the
later, authoritative source.

---

## TASK 2: product photography

### What is wired now

**69 of 93 products carry an image.** Files live in `public/media/products/`
(20MB) and are mapped in `src/lib/products.ts` by `HERBAL_PHOTOS` (keyed by
source S/N) and `SPICE_PHOTOS` (keyed by exact product name). The other 24 keep
the branded placeholder from `src/components/ui/ProductImage.tsx`.

**Know what these images are.** They are AI-rendered label mockups the client
supplied on 30 Oct 2026, not photographs of stock on hand. The artwork is not
the site's own and carries things the site itself refuses to say:

- a brand line, "Natural Solutions. Lasting Wellness.", which is not hers
  (hers is "We Treat, God Heals.")
- claims the site deliberately avoids: "100% Natural", "No Additives",
  "Premium Quality"
- a **®** symbol on the spice jars, which asserts a registered trademark
- on WH-037, the phrase "Natural-Based Sympathies", which is not English

Wiring them in was the owner's explicit decision, made after the conflict with
Principles 1, 3 and 4 was put to them. It is settled; do not quietly revert it.

**Two things still need the client:** confirm these labels match what actually
ships, and resolve the ® and the on-label claims before NAFDAC review.

### Still without an image (24)

Herbal S/N 14, 19, 21, 22, 23, 25, 27, 28, 30, 32, 34, 44, 47, 48, 53, 59, 61,
63, 75. Three of those (Fibroid 21, Ovarian Cyst 23, PCOS 25) sit in
`getFeatured()`, so the homepage row runs two photos to three placeholders.

Spices: Banga (Ofe Akwu), Ginger, Turmeric, Garlic, Black Pepper. Those are
exactly the four the client's brief singled out, plus one. Her brief was
specific about how they must look:

- **Banga (Ofe Akwu)** — must show ripe reddish-orange oil palm fruits
- **Ginger Powder** — ginger roots visible
- **Turmeric Powder** — turmeric roots and powder
- **Garlic Powder** — garlic bulbs and cloves

### Adding more

1. Drop files in `public/media/products/`.
2. Add an entry to `HERBAL_PHOTOS` (by S/N) or `SPICE_PHOTOS` (by exact name).
3. `ProductImage` picks them up automatically; no component changes needed.

**Do not** assign an image to a product unless it is genuinely that product; the
placeholder is the better outcome. Hero last: it needs a composed arrangement
rather than a single packshot, and still uses CSS-composed bottles.

The founder portrait **is** real: `public/founder/wendy-portrait.jpg`, cropped
from her own photo, used in the story band.

`public/media/images/` still holds **67 lifestyle and testimonial images** from
her Facebook page plus `catalog.json`. They are not packshots and are not used
anywhere on the site.

### Videos

19 reels sit in `public/media/videos/` and are **gitignored**: ~706MB total,
one file 124MB, over GitHub's 100MB hard limit. They are on the original
machine only. For production, host on a CDN or Supabase Storage. They are not
used anywhere on the site yet.

---

## Also not built

Roughly in priority order.

1. **Deployment.** In progress — see START HERE at the top and
   [DEPLOY.md](DEPLOY.md).
2. **Admin CRUD.** Sidebar links to Orders, Products, Categories, Inventory,
   Reviews, Blog, Promotions, Shipping, Reports — all 404. The sidebar was
   built to match the client's approved dashboard mockup; the screens behind it
   were not.
3. **Content pages.** About, Contact, FAQ, Delivery, Returns, Privacy, Terms,
   Medical Disclaimer. All linked from the footer, all 404. The Medical
   Disclaimer matters most given the product names.
4. **Customer accounts.** Guest checkout only. Order history, tracking, saved
   addresses, wishlist persistence beyond localStorage.
5. **Shipping zones.** Way bill is currently agreed on WhatsApp, matching her
   price list note. A configurable engine was specced but not built.
6. **Newsletter storage.** Validates input; only persists with Supabase
   configured, which it currently is not. Says so rather than pretending.
7. **Real order statuses.** The sheet has a Status column she edits by hand.
   Admin cannot yet update order state.

---

## Gotchas that cost real time

**OneDrive corrupts `npm install`.** This project lives under OneDrive, which
syncs every file npm writes, producing half-written packages and silent
failures. Fixed by junctioning `node_modules` to `C:\dev\wendy-herbals-node_modules`
(OneDrive skips reparse points). On a non-OneDrive machine, plain `npm install`
is fine. Symptom if it recurs: `Cannot find module '@swc/helpers/...'` or an
empty `node_modules/.bin`.

**`.env*` in `.gitignore` swallows `.env.example`.** It silently never reached
the first commit. There is now a `!.env.example` negation. Check it survives.

**Middleware matcher can deadlock the login.** `/api/admin/:path*` originally
gated `/api/admin/login` itself, making sign-in impossible. The login page and
its endpoint are explicitly exempted. Do not remove those two lines.

**Next.js 16 specifics.**
- `export const dynamic = "force-dynamic"` is rejected under `cacheComponents`.
  Use `await connection()` plus `export const instant = false`.
- `new Date()` during prerender throws. Module-scope for build-time values
  (see `Footer.tsx`), `useEffect` for client components (see `AdminTopBar.tsx`).
- Tailwind v4 has no `tailwind.config.ts` — tokens live in `@theme` inside
  `src/app/globals.css`.
- `middleware.ts` is deprecated in favour of `proxy.ts`. Still works; warns.

**framer-motion v11 peer-blocks React 19.** Pinned to `^12`.

**Fonts.** Loaded via `next/font` and referenced as `var(--font-heading)` /
`var(--font-body)`. Do not write `"Manrope, sans-serif"` inline — next/font
generates hashed family names and the literal will silently fall back.

---

## Setup checklists

### Google Cloud (developer does this once, ever)

These credentials belong to **the app**, not to Wendy. She never opens Cloud
Console. This was a point of confusion worth stating plainly.

1. Create a project; enable the **Google Sheets API** and the **Google Picker API**.
2. Credentials → OAuth client ID → Web application. Authorised redirect URI must
   match exactly: `https://your-domain.com/api/google/callback` (and the
   localhost equivalent for dev).
3. Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.
4. Create an **API key** → `NEXT_PUBLIC_GOOGLE_API_KEY`. Without it, "use a
   sheet I already have" is disabled (the button explains why rather than
   failing on click).
5. OAuth consent screen → publishing status **In production**. Left in
   "Testing", refresh tokens die after 7 days and her orders silently stop
   saving. With one user the unverified-app notice is a one-time
   *Advanced → Go to app*.

### Vercel

- Set every variable from `.env.example`.
- **Add Vercel KV / Upstash Redis** and set `KV_REST_API_URL` +
  `KV_REST_API_TOKEN`. The Google refresh token must outlive a restart and
  Vercel's filesystem is read-only. Settings detects the absence and warns
  rather than letting her connect something that evaporates.
- Locally the token goes to `.data/` (gitignored), encrypted with `ADMIN_SECRET`.

**`ADMIN_SECRET` signs sessions and encrypts the stored Google token.** Changing
it logs everyone out and drops the connection.

---

## Conventions

- Brand colours and fonts: `@theme` in `src/app/globals.css`. Palette is forest
  `#123D2B`, botanical `#175C3D`, ivory `#F7F4E9`, cream `#EFE9DD`, gold
  `#C6A667`, sage `#A8B99C`, charcoal `#252B23`. Roughly 65% light / 25% green
  / 10% gold.
- Component styles are inlined with Tailwind rather than routed through shared
  `Button`/`Badge` primitives — those existed, went unused, and were removed.
  Follow the inline convention or introduce primitives properly and use them.
- `src/app/(storefront)/` carries the public chrome; `src/app/admin/` has its
  own shell. The root layout holds only `<html>`, fonts and globals — do not
  put storefront chrome back there, it leaked into admin once already.
- Money is always `FORMAT_NGN()` from `src/lib/constants.ts`.
- The Sheets writer never touches past column J, so any column the owner adds
  to the right of her sheet survives every future order. Keep it that way.

---

## Business facts

- WhatsApp / phone: **+234 906 210 4172**
- Bank: **Access Bank · 1232465038 · Juliet Nneka Ogbonna**
  (public — printed on the price list she distributes)
- Facebook: `facebook.com/profile.php?id=61588005566206`
- Brand line: "We Treat, God Heals."
- Tagline: "Rooted in Nature. Inspired by Wellness."
- Way bill is **not** included in listed prices, per her price list note.

**The repo is public.** Her bank details are in the source. They are already
publicly distributed, so this is not a leak — but if the client objects, make
the repo private rather than removing them, since checkout needs them.
