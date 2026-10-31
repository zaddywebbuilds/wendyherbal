/**
 * Newsletter sign-ups.
 *
 * These used to go nowhere unless Supabase was configured, which it never was,
 * so every address a customer typed was validated, thanked for, and then
 * discarded. The endpoint said so honestly, which was the right call at the
 * time, but losing the address is still losing the customer.
 *
 * They now go to the same KV-or-file store the catalogue and testimonials use,
 * so sign-ups work with the infrastructure the deployment already needs.
 * Supabase remains the migration path if the list ever outgrows this.
 */

export interface Subscriber {
  email: string;
  consentedAt: string;
  /** Where they signed up, so an export can tell the homepage from checkout. */
  source: string;
}

export interface NewsletterStore {
  version: 1;
  subscribers: Subscriber[];
  updatedAt: string | null;
}

export const EMPTY_NEWSLETTER: NewsletterStore = {
  version: 1,
  subscribers: [],
  updatedAt: null,
};

const KEY = "wendy-herbals:newsletter";
const FILE_DIR = ".data";
const FILE_PATH = `${FILE_DIR}/newsletter.json`;

const useRedis = () =>
  Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

export const newsletterStorageIsDurable = () =>
  useRedis() || process.env.VERCEL !== "1";

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

export async function loadSubscribers(): Promise<NewsletterStore> {
  let raw: string | null = null;
  try {
    raw = useRedis()
      ? ((await redisCommand(["GET", KEY])) as string | null)
      : await readFileRaw();
  } catch (err) {
    console.error("Could not read newsletter list:", err);
    return EMPTY_NEWSLETTER;
  }
  if (!raw) return EMPTY_NEWSLETTER;

  try {
    const parsed = JSON.parse(raw) as Partial<NewsletterStore>;
    return { version: 1, subscribers: parsed.subscribers ?? [], updatedAt: parsed.updatedAt ?? null };
  } catch (err) {
    console.error("Newsletter list is not valid JSON, ignoring it:", err);
    return EMPTY_NEWSLETTER;
  }
}

/**
 * Adds an address, or leaves it alone if it is already there.
 *
 * Signing up twice is not an error and must not overwrite the original
 * consent date: that date is the record of when they agreed, and under the
 * NDPA it is the thing worth keeping accurate.
 */
export async function addSubscriber(email: string, source: string): Promise<"added" | "already"> {
  const normalised = email.trim().toLowerCase();
  const store = await loadSubscribers();

  if (store.subscribers.some((s) => s.email === normalised)) return "already";

  store.subscribers.unshift({
    email: normalised,
    consentedAt: new Date().toISOString(),
    source,
  });
  store.updatedAt = new Date().toISOString();

  const json = JSON.stringify(store);
  if (useRedis()) await redisCommand(["SET", KEY, json]);
  else await writeFileRaw(json);

  return "added";
}

export async function removeSubscriber(email: string): Promise<void> {
  const normalised = email.trim().toLowerCase();
  const store = await loadSubscribers();
  store.subscribers = store.subscribers.filter((s) => s.email !== normalised);
  store.updatedAt = new Date().toISOString();

  const json = JSON.stringify(store);
  if (useRedis()) await redisCommand(["SET", KEY, json]);
  else await writeFileRaw(json);
}
