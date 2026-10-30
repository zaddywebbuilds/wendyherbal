# Wendy Herbals

Storefront and admin dashboard for Wendy Herbals — herbal wellness products, natural
body care and Nigerian kitchen spices.

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Framer Motion

> **Picking this up fresh? Read [HANDOFF.md](HANDOFF.md) first.** It covers what
> is built, what is not, the decisions already settled and why, and the gotchas
> that cost time. This README is setup only.

## Running locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. The admin dashboard is at `/admin`.

`node_modules` is a junction to a folder outside OneDrive
(`C:\dev\wendy-herbals-node_modules`). OneDrive sync corrupts npm installs, so keep
dependencies off the synced path. On a fresh machine, plain `npm install` is fine.

## What is built

| Area | State |
| --- | --- |
| Homepage | Hero, collections, featured products, spice feature, founder story, newsletter |
| Shop | 93 products, category/availability filters, sort, search, load-more, empty + loading states |
| Product pages | Gallery, tabs, related products, JSON-LD, WhatsApp enquiry |
| Cart | Persistent, quantity limits, slide-out drawer |
| Checkout | Delivery details → bank transfer → WhatsApp receipt handoff |
| Admin | Dashboard shell, live KPIs, charts, low-stock, quick actions |

## Payment flow

There is no card gateway. The customer transfers to Wendy's account, then taps
**I've Paid — Send Receipt on WhatsApp**, which opens WhatsApp pre-filled with the
order number, items, total and delivery address so they can attach the receipt.
Wendy confirms the order after verifying the transfer.

Bank details are in `src/lib/constants.ts` (`BANK_DETAILS`) and are shown publicly
at checkout by design — they are the same details printed on the price list.

The way bill (delivery) is **not** included in listed prices and is agreed on
WhatsApp, matching the note on Wendy's price list.

## Where buyer contacts go

Checkout writes every order to a **Google Sheet** — chosen over a database
because Wendy is not technical. She opens the sheet on her phone, taps a number
to call or WhatsApp, and can add her own columns (the app never writes past
column J, so anything she adds to the right is untouched).

Two tabs are created automatically on the first order:

- **Orders** — one row per order: number, date, buyer, items, total, delivery
  address, notes, and a Status column she can edit as she fulfils.
- **Customers** — one row per person, matched on phone number so repeat buyers
  accumulate rather than duplicate. Tracks order count, lifetime spend and
  whether they opted in to updates.

The admin **Customers** page reads the same sheet, with WhatsApp links and CSV
export. One source of truth, two ways in.

### How Wendy connects it

1. She signs in to `/admin` and opens **Settings**.
2. **Connect my Google account** → Google asks her to allow access.
3. She chooses where orders go:
   - **Make me a new one** — a fresh order book is created in her Drive, or
   - **Use a sheet I already have** — the Google Picker opens and she selects
     the list she already keeps. Her existing rows are left alone; only the
     `Orders` and `Customers` tabs are added if missing.

That is the whole of her involvement. She gives you nothing — not a key, not a
file, not even her Gmail address.

**Every order goes to that one sheet and nowhere else.** Until she picks one,
nothing is saved and checkout says so plainly rather than writing somewhere she
did not choose. She can switch sheets later from the same screen.

The scope is `drive.file` only: access to files this app creates plus any file
she explicitly picks, and nothing else in her Drive. Google classifies it
non-sensitive, so it needs no restricted-scope security review, and the consent
screen says plainly that the app cannot see her other files. Picking an existing
file is exactly how `drive.file` grants access to something the app did not
create — which is why this uses the Picker rather than a pasted link.

### Developer setup (once)

1. In [Google Cloud Console](https://console.cloud.google.com), create a project
   and enable the **Google Sheets API**.
2. **Credentials → Create credentials → OAuth client ID → Web application.**
   Add the authorised redirect URI, matching the deployment exactly:
   - `http://localhost:3000/api/google/callback`
   - `https://your-domain.com/api/google/callback`
3. Put `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env.local`.
   These belong to the app, not to Wendy. You create them once, in your own
   Google account, and they serve every client you build. She never opens Cloud
   Console or sees a key.
   For the "use a sheet I already have" option, also enable the **Google Picker
   API**, create an **API key**, and set `NEXT_PUBLIC_GOOGLE_API_KEY`. Without
   it that button is disabled and only "make me a new one" is offered.
4. Set `ADMIN_PASSWORD` and `ADMIN_SECRET` (see below) — the dashboard stays
   locked without them.
5. On **OAuth consent screen**, set publishing status to **In production**.
   Left in "Testing", refresh tokens expire after seven days and her orders
   silently stop saving. With one user, the unverified-app notice is a one-time
   *Advanced → Go to app* click.

**On Vercel, also add a KV store.** The refresh token must outlive a restart,
and Vercel's filesystem is read-only. Add Vercel KV / Upstash Redis and set
`KV_REST_API_URL` and `KV_REST_API_TOKEN`. Settings shows a warning when the
deployment has nowhere durable to keep the connection. Locally the token goes
to `.data/` (gitignored) automatically, encrypted with `ADMIN_SECRET`.

### Admin sign-in

`/admin` is gated by `ADMIN_PASSWORD` behind a signed, HTTP-only session cookie.
The gate fails closed: with no password set, the dashboard is unreachable rather
than open. This is not optional decoration — without it anyone could hit
Settings and point the shop's order book at their own Google account.

`ADMIN_SECRET` signs the session and encrypts the stored Google token. Changing
it logs everyone out and drops the connection.

### Alternative: a service account

If you would rather wire a shared sheet by hand than use the button, set
`GOOGLE_SHEETS_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL` and `GOOGLE_PRIVATE_KEY`
instead, share the sheet with the service account as Editor, and verify with:

```bash
npm run check:sheet
```

An OAuth connection takes precedence when both are present.

Without these variables the site still works: checkout completes and the order
still reaches WhatsApp in full. The API just reports honestly that nothing was
saved rather than claiming a success.

### Consent

Placing an order is not consent to marketing. The opt-in is a separate,
never-pre-ticked checkbox at checkout and lands in the "Updates OK?" column.
Only message people marked `Yes` about products and offers.

## Catalogue

`src/lib/products.ts` holds 81 herbal/body-care products transcribed from Wendy's
three-page price list (28 Oct 2026), preserving source names, S/N numbering and
prices, plus 12 food spices.

- Prices are ₦800–₦25,000.
- Food spices carry `price: null` — they are not on the supplied price list, so the
  UI shows an enquiry CTA instead of inventing a figure.
- S/N 52 and S/N 63 are both "Ulcer Herbs" at ₦15,000. Both rows are kept and
  recorded in `DUPLICATE_AUDIT` for an admin to resolve.
- `stock_count: 0` means "not counted yet", not "sold out". Low-stock reporting
  ignores zero so it raises no false alarms.

## Product photography

`public/media/images/` holds the vetted Facebook image library. These are lifestyle
and testimonial photos, **not** per-product packshots, so products currently render
a branded "photo pending" placeholder rather than a borrowed or mismatched image.

Source reel videos are gitignored — they total ~706MB and one file exceeds GitHub's
100MB limit. They remain on disk for local use; host them on Supabase Storage or a
CDN for production.

When real packshots arrive, drop them in and set `images: ["/media/products/<file>"]`
on the matching product.

## Not yet built

Customer accounts, the remaining admin CRUD screens (products, orders, content),
shipping zones, blog, and the About/Contact/FAQ/legal pages. Navigation links to
these routes exist and will 404 until the pages land.

`supabase/schema.sql` is kept for later: if the shop outgrows a spreadsheet, or
needs customer logins, that schema is the migration path.

Admin sign-in is a single shared password, which suits one owner. Give each
person their own login before more than one person uses the dashboard — the
login throttle is also in-memory, so it resets on restart and does not span
multiple instances.

Newsletter signup validates input but only stores addresses once Supabase
credentials are set; without them it says so rather than pretending to save.

## Compliance note

Product names reference medical conditions because that is how the source catalogue
names them. The site makes no efficacy claims, publishes no testimonials or
approval badges, and carries a disclaimer in the footer and on product pages.
`nafdac_status` is tracked per product. Review against NAFDAC requirements before
commercial launch.
