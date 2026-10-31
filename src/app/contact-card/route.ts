import { businessVCard } from "@/lib/lead-export";
import { SITE_NAME, WHATSAPP_NUMBER, BRAND_PHRASE } from "@/lib/constants";

/**
 * The shop's contact card, offered to customers after they order.
 *
 * A WhatsApp broadcast only reaches people who have the sender saved as a
 * contact, so a customer who never saves the number cannot be followed up
 * with later, however carefully the buyer list is kept.
 */
export function GET() {
  const vcf = businessVCard({
    name: SITE_NAME,
    phone: WHATSAPP_NUMBER,
    site: process.env.NEXT_PUBLIC_SITE_URL || undefined,
    tagline: `Herbal wellness and food spices. ${BRAND_PHRASE}`,
  });

  return new Response(vcf, {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": 'attachment; filename="wendy-herbals.vcf"',
      "Cache-Control": "public, max-age=3600",
    },
  });
}
