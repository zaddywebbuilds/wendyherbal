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

Supabase schema and auth, customer accounts, order persistence, the remaining admin
CRUD screens (products, orders, customers, content), shipping zones, blog, and the
About/Contact/FAQ/legal pages. Navigation links to these routes exist and will 404
until the pages land.

Newsletter signup validates input but only stores addresses once Supabase
credentials are set; without them it says so rather than pretending to save.

## Compliance note

Product names reference medical conditions because that is how the source catalogue
names them. The site makes no efficacy claims, publishes no testimonials or
approval badges, and carries a disclaimer in the footer and on product pages.
`nafdac_status` is tracked per product. Review against NAFDAC requirements before
commercial launch.
