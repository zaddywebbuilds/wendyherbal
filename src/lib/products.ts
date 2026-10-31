import type { Product } from "./types";

/**
 * Wendy Herbals catalogue.
 *
 * Names, source numbering (S/N) and prices are transcribed verbatim from the
 * client's own three-page price list (WhatsApp, 28 Oct 2026). Nothing here is
 * invented: a product absent from that list carries `price: null` and the UI
 * shows an enquiry CTA instead of a price.
 *
 * Stock is not tracked yet — `stock_count: 0` means "not yet counted", not
 * "sold out". Admin sets real figures, and the low-stock report ignores 0.
 */

type Row = [
  sn: number,
  name: string,
  price: number | null,
  category: Category,
];

type Category = "womens-wellness" | "mens-wellness" | "herbal-collections" | "body-care" | "food-spices";

const BALM_RE = /\b(balm|cream)\b/i;

const ROWS: Row[] = [
  // ---- page 1 (S/N 1–27) ----
  [1, "Infection Soap", 5000, "body-care"],
  [2, "Infection Cream", 5000, "body-care"],
  [3, "Gallstones Herbs", 17000, "herbal-collections"],
  [4, "Sheabutter", 8000, "body-care"],
  [5, "Palm Kernel Oil", 5000, "body-care"],
  [6, "Sea Salt", 5000, "body-care"],
  [7, "Ehi Afor Herbs (Infertility Worm)", 15000, "womens-wellness"],
  [8, "Hyper-Ovulation Booster Herbs for Twins", 17000, "womens-wellness"],
  [9, "Blood Booster Herbs", 10000, "herbal-collections"],
  [10, "Scanty Period Herbs", 15000, "womens-wellness"],
  [11, "High Prolactin Herbs", 15000, "womens-wellness"],
  [12, "Progesterone Herbs", 15000, "womens-wellness"],
  [13, "Slimming Herbs", 15000, "herbal-collections"],
  [14, "Hepatitis Herbs", 20000, "herbal-collections"],
  [15, "Bronchitis Herbs", 15000, "herbal-collections"],
  [16, "Vaginal Steaming Liquid Herbs", 5000, "womens-wellness"],
  [17, "Prostate Enlargement Herbs", 17000, "mens-wellness"],
  [18, "Feminine Herbal Wash", 5000, "body-care"],
  [19, "Staphylococcus Infection Herbs", 15000, "herbal-collections"],
  [20, "Ceased Period Herbs", 15000, "womens-wellness"],
  [21, "Fibroid Herbs with Balm", 17000, "womens-wellness"],
  [22, "Hotness of the Womb Herbs", 12000, "womens-wellness"],
  [23, "Ovarian Cyst Herbs with Balm", 17000, "womens-wellness"],
  [24, "Hormonal Imbalance Herbs", 15000, "womens-wellness"],
  [25, "PCOS Herbs with Balm", 15000, "womens-wellness"],
  [26, "Endometriosis Herbs with Balm", 17000, "womens-wellness"],
  [27, "Blocked Fallopian Tubes Herbs with Balm", 17000, "womens-wellness"],

  // ---- page 2 (S/N 28–54) ----
  [28, "PID Herbs", 15000, "herbal-collections"],
  [29, "Yeast Infection Herbs", 15000, "womens-wellness"],
  [30, "Syphilis Herbs", 15000, "herbal-collections"],
  [31, "Candidiasis Infection Herbs", 15000, "herbal-collections"],
  [32, "Gonorrhea Herbs", 15000, "herbal-collections"],
  [33, "UTI Infection Herbs", 15000, "herbal-collections"],
  [34, "Breast Lump Herbs & Balm", 15000, "womens-wellness"],
  [35, "Manpower with Infection Herbs", 15000, "mens-wellness"],
  [36, "Sperm Motility Herbs", 12000, "mens-wellness"],
  [37, "Sperm Booster Herbs", 15000, "mens-wellness"],
  [38, "Ovulation Herbs", 15000, "womens-wellness"],
  [39, "LH Hormone Herbs", 12000, "womens-wellness"],
  [40, "AMH Hormone Herbs", 12000, "womens-wellness"],
  [41, "Sperm PAP Herbs", 8000, "mens-wellness"],
  [42, "Sperm Morphology Herbs", 15000, "mens-wellness"],
  [43, "Estrogen Hormone Herbs", 12000, "womens-wellness"],
  [44, "E-coli Infection Herbs", 15000, "herbal-collections"],
  [45, "Zero Sperm (Azoospermia) Herbs", 20000, "mens-wellness"],
  [46, "Egg Booster Herbs", 12000, "womens-wellness"],
  [47, "Sepsis Herbs", 15000, "herbal-collections"],
  [48, "Herpes Herbs with Infection Cream", 17000, "herbal-collections"],
  [49, "Warts Herbs with Infection Cream", 17000, "herbal-collections"],
  [50, "Tummy & Fat Blast Herbs", 15000, "herbal-collections"],
  [51, "Sex Sweetener", 5000, "herbal-collections"],
  [52, "Ulcer Herbs", 15000, "herbal-collections"],
  [53, "Diabetes Herbs", 15000, "herbal-collections"],
  [54, "H-Pylori Herbs", 15000, "herbal-collections"],

  // ---- page 3 (S/N 55–81) ----
  [55, "Infertility Flusher", 15000, "womens-wellness"],
  [56, "Toothache Herbs", 12000, "herbal-collections"],
  [57, "Hydrosalpinx Herbs with Balm", 15000, "womens-wellness"],
  [58, "Vaginal Tightener Herbs", 8000, "womens-wellness"],
  [59, "Eye Problem Herbs", 15000, "herbal-collections"],
  [60, "Kidney Stones Herbs", 17000, "herbal-collections"],
  [61, "Goiter Herbs with Balm", 17000, "herbal-collections"],
  [62, "Pile Herbs with Balm", 17000, "herbal-collections"],
  [63, "Ulcer Herbs", 15000, "herbal-collections"], // repeats S/N 52 — see DUPLICATE_AUDIT
  [64, "Arthritis Herbs and Massage Balm", 17000, "body-care"],
  [65, "Rheumatism Herbs and Massage Cream", 17000, "body-care"],
  [66, "Brain Booster Herbs (Big)", 7000, "herbal-collections"],
  [67, "Brain Booster Herbs (Small)", 5000, "herbal-collections"],
  [68, "Original Honey", 5000, "body-care"],
  [69, "Man Power Herbs Soaked with Hot Drink", 10000, "mens-wellness"],
  [70, "Weak Erection Herbs", 15000, "mens-wellness"],
  [71, "Adhesion Herbs", 15000, "womens-wellness"],
  [72, "Weight Gain Herbs", 17000, "herbal-collections"],
  [73, "Ajumbaise", 800, "herbal-collections"],
  [74, "Ajumbaise with Some Infection Herbs", 8000, "herbal-collections"],
  [75, "Anti-Poison Herbs and Balm", 17000, "herbal-collections"],
  [76, "Butt Enlargement Herbs", 25000, "body-care"],
  [77, "Boobs Enlargement Herbs", 25000, "womens-wellness"],
  [78, "Hair Growth Herbs", 10000, "body-care"],
  [79, "Dandruff Herbs", 8000, "body-care"],
  [80, "Herbal Palm Kernel Oil", 5000, "body-care"],
  [81, "Body Pains Herbs and Massage Cream", 15000, "body-care"],
];

/**
 * Food spices do not appear on the supplied price list, so they stay
 * price-less until Wendy sends those figures.
 */
const SPICE_NAMES = [
  "Banga Spices (Ofe Akwu)",
  "Ginger Powder",
  "Turmeric Powder",
  "Garlic Powder",
  "Black Pepper Powder",
  "Jollof Rice Spice",
  "Stew Spice",
  "Soup Mixed Spices",
  "Meat Seasoning",
  "Chicken Seasoning",
  "Sauce Spices",
  "Paprika",
];

const SPICE_STORAGE =
  "Store in a cool, dry place away from direct sunlight. Keep the jar tightly closed after use.";

/** Plain commodities — no medical condition in the name. */
const COMMODITY_SNS = new Set([1, 2, 4, 5, 6, 18, 68, 80]);

/**
 * Product photography, keyed by source S/N for the herbal rows and by exact
 * name for the spices, which carry no S/N.
 *
 * These are rendered pack mockups supplied by the client (30 Oct 2026), not
 * photographs of stock on hand: they show label artwork, and some carry claims
 * and a trademark symbol the site itself does not make. Wiring them in was the
 * owner's decision. Replace with real packshots when they exist.
 *
 * A product absent from these maps keeps the branded placeholder. An image is
 * never reused across products; see Principle 3 in HANDOFF.md.
 */
const HERBAL_PHOTOS: Record<number, string> = {
  1: "01-infection-soap.jpg",
  2: "02-infection-cream.jpg",
  3: "03-gallstones-herbs.jpg",
  4: "04-sheabutter.jpg",
  5: "05-palm-kernel-oil.jpg",
  6: "06-sea-salt.jpg",
  7: "07-ehi-afor-herbs.jpg",
  8: "08-hyper-ovulation-booster-herbs.jpg",
  9: "09-blood-booster-herbs.jpg",
  10: "10-scanty-period-herbs.jpg",
  11: "11-high-prolactin-herbs.jpg",
  12: "12-progesterone-herbs.jpg",
  13: "13-slimming-herbs.jpg",
  15: "15-bronchitis-herbs.jpg",
  16: "16-vaginal-steaming-herbs.jpg",
  17: "17-prostate-enlargement-herbs.jpg",
  18: "18-feminine-herbal-wash.jpg",
  20: "20-ceased-period-herbs.jpg",
  21: "21-fibroid-herbs-with-balm.jpg",
  23: "23-ovarian-cyst-herbs-with-balm.jpg",
  24: "24-hormonal-imbalance-herbs.jpg",
  26: "26-endometriosis-with-balm.jpg",
  29: "29-yeast-infection-herbs.jpg",
  31: "31-candidiasis-infection-herbs.jpg",
  33: "33-uti-infection-herbs.jpg",
  35: "35-manpower-with-infection-herbs.jpg",
  36: "36-sperm-motility-herbs.jpg",
  37: "37-sperm-booster-herbs.jpg",
  38: "38-ovulation-herbs.jpg",
  39: "39-lh-hormone-herbs.jpg",
  40: "40-amh-hormone-herbs.jpg",
  41: "41-sperm-pap-herbs.jpg",
  42: "42-sperm-morphology-herbs.jpg",
  43: "43-estrogen-hormone-herbs.jpg",
  45: "45-zero-sperm-herbs.jpg",
  46: "46-egg-booster-herbs.jpg",
  49: "49-warts-herbs-with-infection-cream.jpg",
  50: "50-tummy-and-fat-blast-herbs.jpg",
  51: "51-sex-sweetener-herbs.jpg",
  52: "52-ulcer-herbs.jpg",
  54: "54-h-pylori-herbs.jpg",
  55: "55-infertility-flusher-herbs.jpg",
  56: "56-toothache-herbs.jpg",
  57: "57-hydrosalpinx-herbs-with-balm.jpg",
  58: "58-vaginal-tightener-herbs.jpg",
  60: "60-kidney-stones-herbs.jpg",
  62: "62-pile-herbs-with-balm.jpg",
  64: "64-arthritis-and-massage-balm.jpg",
  65: "65-rheumatism-and-massage-cream.jpg",
  66: "66-brain-booster-herbs-big.jpg",
  67: "67-brain-booster-herbs-small.jpg",
  68: "68-original-honey.jpg",
  69: "69-man-power-herbs-soaked-with-hot-drink.jpg",
  70: "70-weak-erection-herbs.jpg",
  71: "71-adhesion-herbs.jpg",
  72: "72-weight-gain-herbs.jpg",
  73: "73-ajumbaise.jpg",
  74: "74-ajumbaise-with-some-infection-herbs.jpg",
  76: "76-butt-enlargement-herbs.jpg",
  77: "77-boobs-enlargement-herbs.jpg",
  78: "78-hair-growth-herbs.jpg",
  79: "79-dandruff-herbs.jpg",
  80: "80-herbal-palm-kernel-oil.jpg",
  81: "81-body-pains-herbs-and-massage-cream.jpg",
};

const SPICE_PHOTOS: Record<string, string> = {
  "Banga Spices (Ofe Akwu)": "83-banga-spices-ofe-akwu.jpg",
  "Jollof Rice Spice": "85-jollof-rice-spice.jpg",
  "Stew Spice": "82-stew-spice.jpg",
  "Soup Mixed Spices": "84-soup-mixed-spices.jpg",
  "Meat Seasoning": "86-meat-seasoning.jpg",
  "Chicken Seasoning": "87-chicken-seasoning.jpg",
  "Sauce Spices": "88-sauce-spices.jpg",
  "Paprika": "93-paprika.jpg",
};

const photo = (file?: string) => (file ? [`/media/products/${file}`] : []);

/**
 * Product copy.
 *
 * Built from what the catalogue actually records: the preparation's form (read
 * from its name), its collection, whether a balm or cream ships with it, and
 * whether it carries a published price. Nothing here describes an effect, a
 * benefit or a use, because the business has supplied no ingredient lists,
 * dosages or indications, and inventing them would be both a medical claim and
 * a fabrication. See Principles 1 and 4 in HANDOFF.md.
 *
 * When Wendy supplies real ingredient and usage detail, extend `ingredients`
 * and `safety_info` on the product rather than loosening the wording here.
 */

type Form = {
  /** Noun used for the item itself. */ noun: string;
  /** Sentence describing presentation. */ presented: string;
};

const FORMS: [RegExp, Form][] = [
  [/wash/i, { noun: "herbal wash", presented: "Supplied as a liquid for external use." }],
  [/steaming/i, { noun: "herbal steaming preparation", presented: "Used externally as directed on the pack." }],
  [/soap/i, { noun: "herbal soap", presented: "Supplied as a bar for external use." }],
  [/honey/i, { noun: "honey", presented: "Supplied in a jar." }],
  [/salt/i, { noun: "natural salt", presented: "Supplied loose in a pack." }],
  [/sheabutter|shea butter/i, { noun: "shea butter", presented: "Supplied in a jar for external use." }],
  [/oil/i, { noun: "natural oil", presented: "Supplied in a bottle for external use." }],
  [/powder|spice|seasoning|paprika/i, { noun: "ground preparation", presented: "Supplied as a dry powder." }],
  [/herb/i, { noun: "herbal preparation", presented: "Supplied as a prepared herbal mixture." }],
  [/cream/i, { noun: "herbal cream", presented: "Supplied in a jar for external use." }],
  [/balm/i, { noun: "herbal balm", presented: "Supplied in a container for external use." }],
];

const DEFAULT_FORM: Form = { noun: "herbal preparation", presented: "Supplied as prepared by Wendy Herbals." };

const COLLECTION_LINE: Record<string, string> = {
  "womens-wellness": "Part of the Women's Wellness collection.",
  "mens-wellness": "Part of the Men's Wellness collection.",
  "herbal-collections": "Part of the Herbal Collections range.",
  "body-care": "Part of the Natural Body Care range.",
  "food-spices": "Part of the Food Spices range, blended for Nigerian cooking.",
};

/** Names that are not self-explanatory to someone outside the shop. */
const NAME_NOTES: Record<string, string> = {
  "Ehi Afor Herbs (Infertility Worm)": "Known locally as Ehi Afor.",
  "Ajumbaise": "A traditional mixed preparation known by this name.",
  "Ajumbaise with Some Infection Herbs": "The Ajumbaise preparation supplied together with infection herbs.",
  "Banga Spices (Ofe Akwu)": "The spice blend used for banga, also known as ofe akwu.",
  "Brain Booster Herbs (Big)": "The larger of the two pack sizes.",
  "Brain Booster Herbs (Small)": "The smaller of the two pack sizes.",
  "Man Power Herbs Soaked with Hot Drink": "Supplied already soaked in a spirit, as the name describes.",
  "Zero Sperm (Azoospermia) Herbs": "Named for azoospermia, the clinical term used on the price list.",
};

function describe(name: string, category: string, includesBalm: boolean, priced: boolean): string {
  const form = FORMS.find(([re]) => re.test(name))?.[1] ?? DEFAULT_FORM;
  // honey, salt and shea butter are uncountable; the rest take an article.
  const article = /^(honey|natural salt|shea butter)$/.test(form.noun) ? "" : "a ";
  const parts = [`${name} is ${article}${form.noun} from Wendy Herbals.`];

  const note = NAME_NOTES[name];
  if (note) parts.push(note);

  parts.push(COLLECTION_LINE[category] ?? "");
  parts.push(form.presented);

  if (includesBalm) parts.push("This item ships with its matching balm or cream.");
  if (!priced) parts.push("Price is confirmed on enquiry rather than listed.");

  parts.push(
    "Product names describe what a preparation is traditionally associated with and are not claims of treatment; see our medical disclaimer."
  );

  return parts.filter(Boolean).join(" ");
}

const slugify = (s: string) =>
  s.toLowerCase().replace(/[()&]/g, " ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function buildHerbal(): Product[] {
  return ROWS.map(([sn, name, price, category]) => ({
    id: `wh-${String(sn).padStart(3, "0")}`,
    sku: `WH-${String(sn).padStart(3, "0")}`,
    name,
    slug: slugify(name) + (sn === 63 ? "-63" : ""), // keep the duplicate row addressable
    category,
    description: describe(name, category, BALM_RE.test(name), price !== null),
    price,
    images: photo(HERBAL_PHOTOS[sn]),
    in_stock: true,
    stock_count: 0,
    includes_balm: BALM_RE.test(name),
    nafdac_status: COMMODITY_SNS.has(sn) ? ("not_applicable" as const) : ("pending" as const),
    is_published: true,
    is_enquiry_only: false,
    created_at: new Date(2026, 0, 1).toISOString(),
  }));
}

function buildSpices(): Product[] {
  return SPICE_NAMES.map((name, i) => ({
    id: `sp-${String(i + 1).padStart(3, "0")}`,
    sku: `WH-FS-${String(i + 1).padStart(3, "0")}`,
    name,
    slug: slugify(name),
    category: "food-spices" as const,
    description: describe(name, "food-spices", false, false),
    price: null,
    images: photo(SPICE_PHOTOS[name]),
    in_stock: true,
    stock_count: 0,
    includes_balm: false,
    storage_info: SPICE_STORAGE,
    nafdac_status: "not_applicable" as const,
    is_published: true,
    is_enquiry_only: false,
    created_at: new Date(2026, 0, 1).toISOString(),
  }));
}

export const PRODUCTS: Product[] = [...buildHerbal(), ...buildSpices()];

/**
 * Rows whose names repeat in the source list. Both are kept so the admin can
 * decide whether they are duplicates, separate sizes, or distinct products.
 */
export const DUPLICATE_AUDIT = [{ name: "Ulcer Herbs", source_rows: [52, 63] }];

export const CATEGORY_LABELS: Record<string, string> = {
  "womens-wellness": "Women's Wellness",
  "mens-wellness": "Men's Wellness",
  "herbal-collections": "Herbal Collections",
  "body-care": "Natural Body Care",
  "food-spices": "Food Spices",
};

export const getProduct = (slug: string) => PRODUCTS.find((p) => p.slug === slug);
export const getByCategory = (cat: string) => PRODUCTS.filter((p) => p.category === cat);

export const getFeatured = (n = 5) =>
  ["ovarian-cyst-herbs-with-balm", "pcos-herbs-with-balm", "fibroid-herbs-with-balm",
   "sperm-booster-herbs", "hyper-ovulation-booster-herbs-for-twins"]
    .map(getProduct)
    .filter((p): p is Product => Boolean(p))
    .slice(0, n);

/** stock_count 0 means "not counted yet", so it is excluded from low-stock alerts. */
export const getLowStock = (threshold = 8) =>
  PRODUCTS.filter((p) => p.stock_count > 0 && p.stock_count <= threshold);
