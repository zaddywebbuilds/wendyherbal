# Wendy Herbals

Storefront and admin dashboard for Wendy Herbals — herbal wellness products, natural
body care and Nigerian kitchen spices.

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Framer Motion

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

### One-time setup

**All Wendy gives you is her Gmail address.** She does none of the steps below.

1. In **her** Google account, create a blank sheet (`sheets.new`) so the file
   lives in her Drive and she owns it. Copy the ID from the URL:
   `https://docs.google.com/spreadsheets/d/<ID>/edit`
2. In [Google Cloud Console](https://console.cloud.google.com), create a project
   and enable the **Google Sheets API**.
3. Create a **service account**, then add a **JSON key** and download it.
4. Share the sheet with the service account's `client_email` as **Editor**.
   This step is the one people miss — without it every write returns 403.
5. Put `GOOGLE_SHEETS_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL` and
   `GOOGLE_PRIVATE_KEY` in `.env.local` (see `.env.example` for the exact
   formatting of the key).
6. Confirm it works before handing it over:

   ```bash
   npm run check:sheet
   ```

   It names the exact problem if the key is malformed or step 4 was skipped.

Wendy never touches any of the above — the sheet is simply already in her Drive.

### Why not a "Connect your Google account" button?

An OAuth flow is possible — `drive.file` is a non-sensitive scope, so it would
not need Google's restricted-scope security review. It was not used because the
refresh token needs somewhere persistent to live (Vercel KV, Redis or a
database), and the OAuth app must be published to production or its tokens
expire after seven days. That is three moving parts to reach the same place:
one spreadsheet in Wendy's Drive. Worth revisiting if the app ever serves more
than one shop owner.

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

Admin authentication, customer accounts, the remaining admin CRUD screens
(products, orders, content), shipping zones, blog, and the About/Contact/FAQ/legal
pages. Navigation links to these routes exist and will 404 until the pages land.

`supabase/schema.sql` is kept for later: if the shop outgrows a spreadsheet, or
needs customer logins, that schema is the migration path.

**`/admin` is currently unauthenticated.** Add auth before deploying anywhere
public.

Newsletter signup validates input but only stores addresses once Supabase
credentials are set; without them it says so rather than pretending to save.

## Compliance note

Product names reference medical conditions because that is how the source catalogue
names them. The site makes no efficacy claims, publishes no testimonials or
approval badges, and carries a disclaimer in the footer and on product pages.
`nafdac_status` is tracked per product. Review against NAFDAC requirements before
commercial launch.
