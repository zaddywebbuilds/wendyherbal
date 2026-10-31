/**
 * Customer testimonials, one product at a time.
 *
 * Wendy adds and publishes these herself. Nothing reaches the storefront
 * without her ticking consent and the entry being set to published, because
 * these are other people's words and often their health details.
 *
 * Storage is the same KV-or-file pair as the catalogue and the Google token,
 * so this adds no new service. Entries are plain JSON: they are not
 * credentials, and being able to read them by eye matters when something
 * looks wrong.
 */

export type TestimonialStatus = "draft" | "pending" | "published" | "rejected";

export interface Testimonial {
  id: string;
  /** The product this belongs to. Testimonials are never shown site-wide. */
  productSku: string;
  /** A name or initials the customer agreed to. Never a full name by default. */
  displayName: string;
  text: string;
  /** A screenshot she has already cropped. Same rules as product images. */
  imageUrl?: string;
  source?: string;
  testimonialDate?: string;
  /** Publishing is refused without this. */
  consentConfirmed: boolean;
  /**
   * Set when the text mentions curing, treating or guaranteeing an outcome.
   * Publishing one of those needs a second, explicit acknowledgement.
   */
  claimAcknowledged: boolean;
  status: TestimonialStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface TestimonialStore {
  version: 1;
  items: Testimonial[];
  updatedAt: string | null;
}

export const EMPTY_TESTIMONIALS: TestimonialStore = {
  version: 1,
  items: [],
  updatedAt: null,
};

const KEY = "wendy-herbals:testimonials";
const FILE_DIR = ".data";
const FILE_PATH = `${FILE_DIR}/testimonials.json`;

const useRedis = () =>
  Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

export const testimonialsStorageIsDurable = () =>
  useRedis() || process.env.VERCEL !== "1";

/* ---------------------------------------------------------------- redis */

async function redisCommand(args: (string | number)[]): Promise<unknown> {
  const res = await fetch(process.env.KV_REST_API_URL!, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`KV command failed (${res.status}): ${await res.text()}`);
  const data = (await res.json()) as { result?: unknown };
  return data.result ?? null;
}

/* ----------------------------------------------------------------- file */

async function readFileRaw(): Promise<string | null> {
  const { readFile } = await import("node:fs/promises");
  try {
    return await readFile(FILE_PATH, "utf8");
  } catch {
    return null;
  }
}

async function writeFileRaw(value: string): Promise<void> {
  const { writeFile, mkdir } = await import("node:fs/promises");
  await mkdir(FILE_DIR, { recursive: true });
  await writeFile(FILE_PATH, value, "utf8");
}

/* ------------------------------------------------------------- public API */

export async function loadTestimonials(): Promise<TestimonialStore> {
  let raw: string | null = null;
  try {
    raw = useRedis()
      ? ((await redisCommand(["GET", KEY])) as string | null)
      : await readFileRaw();
  } catch (err) {
    // A storage outage must not take a product page down with it.
    console.error("Could not read testimonials:", err);
    return EMPTY_TESTIMONIALS;
  }

  if (!raw) return EMPTY_TESTIMONIALS;

  try {
    const parsed = JSON.parse(raw) as Partial<TestimonialStore>;
    return { version: 1, items: parsed.items ?? [], updatedAt: parsed.updatedAt ?? null };
  } catch (err) {
    console.error("Testimonials are not valid JSON, ignoring them:", err);
    return EMPTY_TESTIMONIALS;
  }
}

async function save(store: TestimonialStore): Promise<void> {
  const next: TestimonialStore = { ...store, version: 1, updatedAt: new Date().toISOString() };
  const json = JSON.stringify(next);
  if (useRedis()) await redisCommand(["SET", KEY, json]);
  else await writeFileRaw(json);
}

export async function mutateTestimonials(
  fn: (store: TestimonialStore) => TestimonialStore
): Promise<TestimonialStore> {
  const current = await loadTestimonials();
  const next = fn(structuredClone(current));
  await save(next);
  return next;
}

/** Only what the public may see, newest first. */
export async function publishedFor(productSku: string): Promise<Testimonial[]> {
  const { items } = await loadTestimonials();
  return items
    .filter((t) => t.productSku === productSku && t.status === "published" && t.consentConfirmed)
    .sort((a, b) => (b.publishedAt ?? b.createdAt).localeCompare(a.publishedAt ?? a.createdAt));
}

/**
 * Words that turn a nice note into a medical claim.
 *
 * This is a prompt for a human decision, not a filter: it flags the entry so
 * Wendy has to acknowledge the claim before it can be published. The site's
 * own Medical Disclaimer says it publishes no claims of treatment, so one
 * slipping through a review screen is the thing to guard against.
 */
const CLAIM_PATTERNS = [
  /\bcure[ds]?\b/i, /\bcuring\b/i, /\bheal(ed|s|ing)?\b/i, /\btreat(ed|s|ment)?\b/i,
  /\bpregnan/i, /\bconceiv/i, /\bdiagnos/i, /\bdisease\b/i, /\binfection\b/i,
  /\bguarantee/i, /\bpermanent/i, /\bfibroid|pcos|hepatitis|ulcer|diabetes|cancer\b/i,
];

export function detectsMedicalClaim(text: string): boolean {
  return CLAIM_PATTERNS.some((re) => re.test(text));
}
