# Handoff — Wendy Herbals

Everything needed to pick this up cold. Read this before touching code; it
records not just what exists but **why**, so decisions already settled are not
relitigated.

**Client:** Wendy Herbals, a Nigerian herbal wellness and food-spice business.
**Repo:** `github.com/zaddywebbuilds/wendyherbal`
**Owner is not technical.** That constraint drove most of the architecture below.

---

## ▶ START HERE — the site is live, and misconfigured

**https://wendyherbal.vercel.app returns 200.** The client connected Vercel to
the GitHub repo, so pushes to `main` deploy themselves. The CLI on the build
machine is still unauthenticated (`vercel whoami` → `Not authorized`), which no
longer matters: nothing here needs it.

What does matter is that **three environment variables are missing in Vercel**,
and each one silently disables something. Verified against the live site on
31 Oct 2026:

| Missing | What it breaks, observed |
|---|---|
| `ADMIN_PASSWORD` + `ADMIN_SECRET` | `/admin` 307s to `/admin/login?setup=1`. The gate fails closed, which is right, but **Wendy cannot sign in at all** — Products, Orders, Customers, Testimonials and the lead downloads are unreachable in production. |
| `NEXT_PUBLIC_SITE_URL` | `/sitemap.xml` is **empty** (the builder returns `[]` with no base), canonicals render relative (`href="/shop"`), and Open Graph has no absolute image URLs. |

Set those and both problems go away; no code change is involved. Re-check with:

```bash
curl -s -o /dev/null -w "%{http_code} -> %{redirect_url}\n" https://wendyherbal.vercel.app/admin
curl -s https://wendyherbal.vercel.app/sitemap.xml | head -5
```

**`robots.txt` says `Disallow: /`, and that is deliberate** — see `src/app/robots.ts`.
Indexing stays off until the NAFDAC review is done and the rendered mockups are
replaced with real photographs. Flip `NEXT_PUBLIC_ALLOW_INDEXING=true` then, not
before: de-indexing herbal products named after medical conditions is slow.

**The custom domain is not connected.** `wendyherbals.com` does not resolve.
Until it does, `NEXT_PUBLIC_SITE_URL` should be the `.vercel.app` address, or
the sitemap and canonicals will advertise a dead host.

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

Product photography is **complete in the sense that nothing shows a placeholder**: all 93 carry an image.
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
| Admin dashboard | ✅ Reads the order sheet. Real figures, honest zeros |
| Admin Customers | ✅ Done — list, WhatsApp links, contact-card and CSV downloads |
| Admin Settings | ✅ Done — Google connect + sheet chooser |
| SEO | ✅ robots (blocking) + sitemap, 100 URLs |
| **Deployment** | ⏸ **Resume here.** Blocked on `vercel login` |
| Product photos | ✅ All 93 carry one. 80 packshots, 13 botanical stand-ins |
| Brand media | ✅ 9 photos + 3 silent clips placed. Rest of library unpublishable |
| Product copy | ✅ All 93 have real descriptions, generated from catalogue facts |
| Admin Orders | ✅ Done. Reads the sheet, CSV export, read-only |
| Admin Products | ✅ Editable. Add, edit, hide, delete, from a phone |
| Admin Inventory | ✅ Stock view, built on the editable catalogue |
| Testimonials | ✅ Wendy adds them. Consent and claim gates enforced server-side |
| Admin CRUD screens | ✅ No dead links. 13 unbuilt screens retired from the nav |
| Content pages | ✅ All 8 built. Policy gaps flagged on the pages themselves |

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
- **12 food spices**, now priced by bottle size: ₦2,500 small, ₦5,000 big,
  confirmed by Wendy on 31 Oct 2026. They are the only products with
  variants; see `src/lib/pricing.ts`.

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

**All 93 products carry an image.** Files live in `public/media/products/`
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

### Three more came out of the hero video

The hero clip supplied on 30 Oct 2026 contains packshots for products that had
none. Frames were cut from it at full resolution and cropped square for
Fibroid Herbs with Balm (21), Ovarian Cyst Herbs with Balm (23) and Banga
Spices (83). These are the client's own renders of those exact products, so
this is not an image borrowed from a neighbouring product. The clip also shows
Sheabutter, Original Honey and Herbal Palm Kernel Oil, which already had
images, so nothing was replaced.

### The last gap closed, and how

The client sent `Wendy_Herbals_Missing_Images.zip` on 31 Oct 2026. It held
eight packshots and four photographs of a plain house jerrycan.

**Eight real packshots** went straight in: Hotness of the Womb (22), PCOS (25),
Blocked Fallopian Tubes (27), Ulcer (63), and the Ginger, Turmeric, Garlic and
Black Pepper powders. Every label was read before use. Two notes:

- Its README claimed 27 came from a generic "natural wellness" sample. It did
  not. The image is a correct Blocked Fallopian Tubes pack with its balm.
  Check the pictures, not the manifest.
- `63-ulcer-herbs.jpg` is **byte for byte** the file already on WH-052. Using
  it for WH-063 assumes the two price-list rows are the same product, which is
  still the open DUPLICATE_AUDIT question.

**Thirteen products have no packshot and will not get one.** The client
declined to render condition-named packaging for Hepatitis, Staphylococcus,
PID, Syphilis, Gonorrhea, Breast Lump, E-coli, Sepsis, Herpes, Diabetes, Eye
Problem, Goiter and Anti-Poison, which was the right call: a
"SYPHILIS HERBS, Safe & Effective" render is the last thing this catalogue
needs. On the owner's instruction they now carry botanical and workshop
photographs from her own Facebook material, prefixed `fb-` in
`public/media/products/`.

**Be clear about what those are.** They show herbs, powders, production drums
and the preparation work, not the pack the buyer receives, and nine images
cover thirteen products so some repeat. This is a deliberate departure from
Principle 3, made by the owner after the trade-off was put to her. The product
page's "Packaging and contents are confirmed at order" line carries the weight.
Replace them with real packshots when they exist.

The spice brief is now satisfied for Banga, Ginger, Turmeric and Garlic. Her
brief was specific about how they must look:

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
2. **Admin CRUD.** Built, and the sidebar has no dead links: Dashboard,
   Orders, Products, Inventory, Testimonials, Customers, Newsletter and
   Settings all resolve. The thirteen screens from the approved mockup that
   had nothing behind them were retired from the nav rather than left to 404.

   Orders reads the Orders tab via `listOrders()`, with a table on desktop and
   cards on a phone, an awaiting-payment count and a CSV export. It is
   **read-only on purpose** — see "What the Google Sheet is for".

   The sidebar badge is **not** wired to the sheet. The admin layout wraps
   every route including login, so a read there costs a Google call per page
   load, one of them unauthenticated, and it stops `/admin/login`
   prerendering. The count lives on the Orders page instead.

   Products edits for real, from a phone or a computer, including adding and
   deleting. The catalogue is a TypeScript module on a read-only filesystem,
   so edits live in a KV overlay merged over the coded rows at read time — see
   "The editable catalogue". `supabase/schema.sql` remains the migration path
   if this ever outgrows KV.

3. **Blog.** Linked from the footer until now; the link was removed because
   there is no blog and no post store behind it. Restore the footer entry when
   one is built.
4. **Customer accounts.** Guest checkout only, and deliberately so. The account
   icon was removed from the header on 31 Oct 2026: it advertised something
   that does not exist, and the FAQ already says there are no accounts. The
   wishlist is built at `/wishlist`, backed by localStorage, so it needs no
   account. Still missing: order history and tracking.
5. **Shipping zones.** Way bill is currently agreed on WhatsApp, matching her
   price list note. A configurable engine was specced but not built.
6. **Real order statuses.** The sheet has a Status column she edits by hand.
   Admin cannot update order state, and **this is now a decision, not a gap** —
   see "What the Google Sheet is for" below. Do not build a writer.

---

## What the Google Sheet is for

Settled by the client on 31 Oct 2026: **the sheet's job is keeping customer
contacts so she can follow up later.** It is the order book and the address
book, nothing more.

So **do not build order-status write-back.** Two writers on one cell, with her
editing by hand in Sheets while an admin page holds a stale copy, buys a
conflict-resolution problem in exchange for something she did not ask for.
`listOrders()` still carries each row's 1-based `row` number; leave it
unused rather than acting on it.

### Following up, and why the contact card exists

She works from a phone and follows up on WhatsApp, so the export that matters
is **`.vcf`, not `.csv`**: WhatsApp only shows people who are in the phone's
contacts. `/admin/customers` offers both, each in two scopes — everyone who
bought, and only those who ticked the updates box. The scope is chosen before
the download rather than left as a column to remember to read, because that is
a consent line.

**A WhatsApp broadcast only reaches recipients who have the sender's number
saved.** Everyone else is silently skipped, with no error. That is why
`/contact-card` exists and why the checkout confirmation offers "Save our
number to your phone": without it, a carefully kept buyer list still reaches
nobody. If that link is ever removed, the follow-up feature stops working and
nothing will report it.

Numbers too short to dial are left out of the `.vcf` and the page says how
many, so a half-complete contacts file is not mistaken for the whole list.

### Not the WhatsApp Business Platform

Bulk sending through Meta's API needs a verified business, a phone number
dedicated to the API and separate from the WhatsApp app, Meta-approved
marketing templates, and per-message fees. It is a setup project, not a
setting. The broadcast path above costs nothing and needs no approval.

---

## The written pages

About, Contact, FAQ, Delivery, Returns, Privacy, Terms and Medical Disclaimer
all exist under `src/app/(storefront)/`, sharing the primitives in
`src/components/content/ContentPage.tsx` (PageHero, Section, List, Callout,
ContactStrip, Related). Those primitives are deliberate: eight pages use them.
A one-off page should still follow the inline Tailwind convention.

**Every fact on them is sourced from the repo**, not from a template. Prices,
bank details, the way bill note and the data-collection list are read from
`constants.ts`, the checkout form and the Sheets schema, so they cannot drift
from what the site does. The product and category counts on About are computed
from the catalogue at build time.

**Where a policy does not exist yet, the page says so.** A `Callout` with
`tone="pending"` marks each one, visibly, in the customer's own words. These
are the open questions, and each one needs the client, not a developer:

| Page | Needs from the client |
| --- | --- |
| Contact | Whether to publish an email address, shop address, opening hours |
| Delivery | Timeframes, a price per state, which couriers |
| Returns | A returns window, conditions, refund turnaround |
| Privacy | How long order records are kept; registered name and address as data controller |
| Terms | Legal entity name, RC number, registered address, jurisdiction for disputes |
| FAQ | Carries the delivery and returns gaps; resolves when those do |

Do **not** fill these in by inventing a reasonable-sounding figure. A 7-day
returns window the owner never agreed to is a promise she has to honour.

**Two footer links were removed** because nothing exists behind them: Blog and
Order Tracking. Both are one line to restore in `Footer.tsx`, which carries a
comment saying so. Every remaining footer link resolves; `/wishlist` and
`/account` in the **header** still 404 and belong to customer accounts.

The Medical Disclaimer leads with the warning rather than brand furniture, and
is linked from About, FAQ, Terms and every product page. It states plainly that
a product name is not a claim, which is the thing most likely to matter if the
catalogue is ever challenged.

## The design system, and the checkout rule

A review of the live site on 31 Oct 2026 drove a pass over the storefront.
Two things from it are rules now rather than preferences.

**Rhythm and shape.** Bands are `py-14 lg:py-24`, 56px on a phone and 96px on
a laptop. The hero opens wider at `py-16 lg:py-28`. Cards are 12px or 16px and
nothing in between. Shadows stay under 0.2 alpha, because on ivory anything
heavier reads as dirt. The botanical pattern belongs on the hero and the
founder band only; over a photograph it is noise. This is written at the top
of `globals.css`.

**The palette did not change.** The review proposed warming the ivory to
#F8F3E7. It is #F7F4E9 because that is what the client approved, and swapping
an approved brand colour is her call.

**Quote before payment.** Checkout sends the order first, Wendy confirms the
way bill and the full total, and payment follows that figure. The old flow
said "Pay by Bank Transfer", labelled the product subtotal "Amount to
transfer" and ended on "I've Paid", which asked people to pay an amount that
was not their total. Do not reintroduce a total anywhere that excludes the way
bill: the cart summary says "Products total" for exactly this reason, and the
WhatsApp message asks for a quote rather than claiming a payment was made.

### Claims removed, and why they keep coming back

Three separate times, copy asserted something nothing supported:

- the hero trust row: "100% Ingredients", "Premium Quality", "Safe & Trusted"
- the featured row: "New" and "Bestseller", from a hardcoded map of grid
  positions, on a shop that has taken no orders
- the About page: that the founder personally prepares, answers and packs,
  which was written without confirming it

All are gone. The pattern to watch is decorative copy that sounds like a fact.
On a catalogue named after medical conditions with no NAFDAC review, "Safe"
is not decoration.

## Testimonials

Wendy adds these herself at `/admin/testimonials`, one per product. The store
is the same KV-or-file pair as the catalogue, so no new service.

**Two refusals live in the API, not just the form**, because they protect the
customer rather than the shop:

1. Nothing publishes without `consentConfirmed`. These are other people's
   words.
2. Nothing whose text reads as a medical claim publishes without a separate
   `claimAcknowledged` tick. `detectsMedicalClaim` flags cure, heal, treat,
   pregnancy, named conditions and guarantees, and the form shows the warning
   as she types. It prompts a human decision rather than silently filtering.

The second gate exists because the Medical Disclaimer this site serves states
plainly that Wendy Herbals publishes no testimonials claiming treatment. If
testimonials carrying claims start going up, that page is no longer true and
has to be rewritten with them. Do not let the two drift apart.

The product page renders nothing when a product has none, rather than an empty
"no reviews yet" shell that invites someone to invent some.

**The Facebook library is still not a source for these.** Those screenshots
name real patients alongside their conditions and show faces, phone numbers
and a hospital radiology report. Consent comes from the customer before any
of it is retyped here, and a screenshot needs cropping first.

## The dashboard

Everything on `/admin` is derived in `dashboard-data.ts` from the order
sheet, the customer tab and the merged catalogue. Nothing is illustrative.

The approved mockup is not a specification for the numbers. It showed
₦1,248,500 in sales, 186 orders, 142 customers, "+18% vs last month", "42
sold" and sidebar badges of 12, 5 and 3. **All of it was invented**, and it
priced Ovarian Cyst Herbs at ₦420,000 against ₦17,000 on the client's own
price list. The layout was approved; the figures were never real.

What is derived, and from what:

| Widget | Source |
| --- | --- |
| Order value, Total orders | sheet rows, excluding cancelled and refunded |
| Month-on-month change | the Date column, this month against last |
| Total customers | the Customers tab |
| Products in stock, Low stock | the merged catalogue, so admin edits count |
| Order status donut | the free-text Status column, bucketed loosely |
| Recent orders | the five newest rows |
| Top sellers, Sales by category | the Items column, parsed |

**The Items column is text**, written by `/api/orders` as
`Name (size) xQty; Name xQty`. `parseItems` keeps the label whole,
brackets included, because real product names contain them: "Brain Booster
Herbs (Big)", "Banga Spices (Ofe Akwu)". An earlier version stripped a
trailing bracket to drop the size, which merged the two Brain Booster pack
sizes into one row and matched neither against the catalogue. The size is
stripped only as a fallback when an exact match fails.

When no order's items can be read, the top sellers and category widgets show
an empty state rather than zeros, because a zero there would read as "nothing
sold" instead of "cannot be worked out".

`admin-data.ts` is gone. It held a hardcoded empty `ORDERS` array that
every dashboard figure was computed from, which is why the screen showed zeros
no matter what the sheet contained.

## The editable catalogue

The owner edits products from the admin screens on a phone or a computer.
Nothing goes through the spreadsheet, and nothing needs the developer.

**How it fits together.** Products still ship in code (`products.ts`), which
is fast and costs nothing to serve. The editable part is a small overlay
document in `catalogue-store.ts`:

| Piece | What it holds |
| --- | --- |
| `patches` | changes to coded products, keyed by SKU |
| `created` | products added in admin, which exist only here |
| `removed` | SKUs of created products she deleted |

`catalogue.ts` merges the two and is the only thing the site reads.
A coded product is **never deleted**, only hidden, so any edit can be undone
with "Undo my edits", which drops the patch and restores exactly what the code
says. Fields absent from a patch keep the coded value, which is what makes
that undo possible.

**Storage is the same KV-or-file pair the Google token already uses.** No new
service. On Vercel this means **Upstash Redis is now required for editing**,
not just for the Google connection: without it `catalogueStorageIsDurable()`
is false, the API refuses writes with an explanation, and the admin screens
say editing is switched off rather than letting her type changes that vanish.

### The caching mistake worth not repeating

Two caching attempts were made and both were removed:

1. `unstable_cache` with a tag, purged by `revalidateTag`.
2. The `"use cache"` directive with `cacheTag`, purged by `revalidateTag`
   plus `revalidatePath`.

In both, a saved price change reached `/api/orders` (which reads fresh) but
**not** the product page, which went on serving the old price. The shop would
have shown one price and charged another. Neither purge mechanism reliably
cleared the entry from a route handler in this Next version.

`getCatalogue()` is therefore uncached, and the three pages that call it
declare `instant = false`. That costs one small KV read per render against a
catalogue of a few kilobytes. **If you re-add a cache, prove the invalidation
against a deployed build before trusting it, not in dev.**

### What is not built

Uploading a photograph from the phone. The form offers the pictures already in
`public/media/`, and says so. Real upload needs blob storage (Vercel Blob is
the obvious choice) and is the natural next step.

## Brand media, and what must never be published

`src/lib/media.ts` is the registry: nine photographs under
`public/media/brand/` and three silent clips under `public/media/clips/`,
each with alt text written from the picture itself. They feed the hero, the
five collection cards, the homepage "How it is made" band, the About gallery
and the Open Graph tags.

The clips are cut to 12 seconds, re-encoded to 960px and **stripped of audio**,
because the source reels carry licensed music from a social editing app that
the shop has no commercial licence for. A CapCut watermark and a song-credit
sticker are burned into some frames; replacing them needs new footage.

### The hero clip, and a claim worth watching

The homepage hero is a video the client supplied on 30 Oct 2026, registered as
`HERO_CLIP` and served from `public/media/clips/hero-product-range.mp4`.
It is 11 seconds of product packshots appearing against a farm backdrop,
closing on a portrait of the founder. Re-encoded from 14.8MB to 2.3MB, no
audio track in the source. Desktop plays it; a phone gets the poster frame
and downloads no video at all, the same rule as the workshop tiles.

It carries **no** testimonial, patient or treatment content, which is why it
was usable at all. But its labels go further than the packshots already on the
site. Alongside the familiar "100% Natural" and the nonsense phrase
"Natural-Based Sympathies", they read:

> Safe & Effective

on products named after medical conditions, Ovarian Cyst Herbs among them.
That is a therapeutic and safety claim, and it is the most prominent thing on
the homepage. It contradicts the Medical Disclaimer this site serves, which
tells people a product name is not a claim and to speak to a doctor first.
The owner was told and chose to use the clip.

**This is the one to raise with the client before launch**, ahead of the
packshot labels, because "Effective" is a stronger claim than anything else
published here and it sits above the fold.

### The rest of the library is not publishable

Of 67 images in `public/media/images/`, only nine were cleared. Every image
was reviewed. The rest fall into four groups, and each is a separate reason:

1. **Third-party medical records.** `photo_10_xray.jpg` and
   `photo_12_xray_text.jpg` photograph a hospital radiology report from St
   Patrick Hospital, Mile Four, Abakaliki, showing a named patient, her age,
   sex and a clinical history of secondary infertility. Others show patients'
   bare abdomens mid-treatment, customers' babies, and WhatsApp threads with
   names and phone numbers. This is sensitive personal data belonging to people
   who have not consented to a commercial website. Publishing it would breach
   the NDPA and the Privacy Policy this site already serves.
2. **A poster claiming to treat HIV and Hepatitis C.**
   `cover_banner_prophetess_wendy.jpg` lists both, among others, under
   "Prophetess Wendy, Spiritual and Herbal Treatment".
3. **Testimonials naming conditions**, including hepatitis B, hormonal
   imbalance and sperm count. The Medical Disclaimer states the site publishes
   none.
4. **Personal photographs** of the founder's family, home and dog.

The same applies to the videos: of 19, eight are testimonial, treatment or
consultation footage. Only `herbal_production` and `brand` were considered,
and three of those were used.

**Do not "finish the job" by wiring the rest in.** The owner approved the
cleared set specifically, after the contents were described to her. Anything
more needs her informed decision, and the patient material needs the patients'.

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
