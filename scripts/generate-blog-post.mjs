/**
 * Daily blog post generator for Wendy Herbals.
 *
 * Reads the next product from scripts/product-queue.json,
 * calls DeepSeek to write a condition-focused blog post,
 * appends the new post to src/data/blog-posts.ts, and
 * removes the product from the queue.
 *
 * Required env: DEEPSEEK_API_KEY
 * Usage: node scripts/generate-blog-post.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const QUEUE_PATH = path.join(__dirname, "product-queue.json");
const POSTS_PATH = path.join(ROOT, "src", "data", "blog-posts.ts");
const MARKER = "  // <AUTO_GENERATED_END>";
const TODAY = new Date().toISOString().slice(0, 10);

const COVER_IMAGES = [
  "/media/brand/measuring-herbal-preparation.jpg",
  "/media/brand/filling-herbal-preparation.jpg",
  "/media/brand/ground-herb-powders.jpg",
  "/media/brand/dried-herbs-and-hibiscus-bowls.jpg",
  "/media/brand/production-drums.jpg",
];

const SYSTEM_PROMPT = `You are a health content writer for Wendy Herbals, a Nigerian herbal medicine business.

Write a blog post about a specific health condition that Nigerians search for. The post must:
- Be written for a Nigerian audience — use Nigerian terms and context, mention Nigerian foods and habits where relevant
- Explain the condition clearly in plain language
- List common symptoms
- Discuss causes in the Nigerian context
- Walk through the herbal/natural approach Nigerians traditionally use
- End with a CTA section linking to the specific Wendy Herbals product

STRICT compliance rules:
- NEVER say the product "treats", "cures", "diagnoses" or "prevents" any condition
- Use phrases like: "traditionally associated with", "used for", "herbal preparation for this concern", "herbal support for"
- End with a note callout: title "About this article", content ending with "does not constitute medical advice"
- NEVER use em dashes (—) anywhere in the content — use commas, colons, or rewrite the sentence instead
- Do NOT use the word "cures", "treats", "heals", "remedy that works", or any claim that implies medical efficacy

Return ONLY a valid JSON object. No markdown fences, no explanations, no preamble — raw JSON only.

The object must match this TypeScript interface exactly:
{
  "slug": string,           // kebab-case, keyword-rich, ends with -nigeria e.g. "low-sperm-count-nigeria"
  "title": string,          // 55-70 chars, keyword-rich, e.g. "Low Sperm Count in Nigeria: Causes and What Men Use"
  "excerpt": string,        // 2-3 sentences, 120-160 chars
  "category": string,       // exactly one of: "Women's Wellness" | "Men's Wellness" | "General Wellness" | "Body Care" | "Herb Guide"
  "publishedAt": string,    // TODAY's date: "${TODAY}"
  "coverSrc": string,       // exactly one of the 5 paths listed below
  "coverAlt": string,       // brief descriptive alt text
  "keywords": string[],     // 6-8 phrases Nigerians actually search, include "Nigeria"
  "sections": Array<section>
}

Cover image options (pick the most fitting):
${COVER_IMAGES.map((p) => `  "${p}"`).join("\n")}

Section types:
  { "type": "p", "content": "..." }
  { "type": "h2", "content": "..." }
  { "type": "h3", "content": "..." }
  { "type": "list", "items": ["...", "..."] }
  { "type": "callout", "title": "...", "content": "...", "tone": "note" | "caution" | "pending" }
  { "type": "cta", "title": "...", "content": "...", "href": "/product/SLUG", "ctaLabel": "View PRODUCT NAME - PRICE" }

Recommended sections structure (use this order):
1. p - opening: what the condition is, why it matters for Nigerians
2. h2 - "Common symptoms"
3. list - 5-7 clear symptom bullets
4. h2 - "What causes it" (or similar)
5. p - causes in Nigerian context
6. h2 - another useful section (diet, prevention, what to watch for, etc.)
7. list or p - content for that section
8. h2 - one more section if needed
9. callout (caution) - "When to see a doctor" with specific red flags
10. cta - product card
11. callout (note) - "About this article" disclaimer

Write 8-12 sections total. Make the content genuinely useful, specific, and accurate.`;

async function main() {
  if (!process.env.DEEPSEEK_API_KEY) {
    console.error("Missing DEEPSEEK_API_KEY");
    process.exit(1);
  }

  const queue = JSON.parse(fs.readFileSync(QUEUE_PATH, "utf8"));
  if (queue.length === 0) {
    console.log("Product queue is empty — all products have been covered.");
    process.exit(0);
  }

  const product = queue[0];
  console.log(`Generating post for: ${product.name} (${product.slug})`);

  const userMessage = `Topic: ${product.topic}
Product name: ${product.name}
Product page URL: /product/${product.slug}
Price: N${product.price.toLocaleString()}
CTA button label: "View ${product.name} - N${product.price.toLocaleString()}"
Category hint: ${product.category}
Today's date: ${TODAY}`;

  const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      temperature: 0.6,
      max_tokens: 3000,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("DeepSeek API error:", response.status, err);
    process.exit(1);
  }

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content ?? "";

  let post;
  try {
    // Strip markdown code fences if present
    const cleaned = raw
      .replace(/^```(?:json)?\s*/m, "")
      .replace(/\s*```\s*$/m, "")
      .trim();
    post = JSON.parse(cleaned);
  } catch (e) {
    console.error("Failed to parse DeepSeek response as JSON:");
    console.error(raw);
    process.exit(1);
  }

  // Validate required fields
  const required = ["slug", "title", "excerpt", "category", "publishedAt", "coverSrc", "keywords", "sections"];
  for (const field of required) {
    if (!post[field]) {
      console.error(`Missing required field: ${field}`);
      console.error(JSON.stringify(post, null, 2));
      process.exit(1);
    }
  }

  // Enforce today's date
  post.publishedAt = TODAY;

  // Append to blog-posts.ts before the marker
  const content = fs.readFileSync(POSTS_PATH, "utf8");
  const markerIdx = content.lastIndexOf(MARKER);
  if (markerIdx === -1) {
    console.error(`Marker "${MARKER}" not found in blog-posts.ts`);
    process.exit(1);
  }

  const indented = JSON.stringify(post, null, 2)
    .split("\n")
    .map((line, i) => (i === 0 ? `  ${line}` : `  ${line}`))
    .join("\n");

  const updated =
    content.slice(0, markerIdx) +
    indented +
    ",\n" +
    content.slice(markerIdx);

  fs.writeFileSync(POSTS_PATH, updated);

  // Remove from queue
  queue.shift();
  fs.writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2) + "\n");

  console.log(`Post generated successfully.`);
  console.log(`BLOG_POST_SLUG=${post.slug}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
