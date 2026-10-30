import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle, Phone, Facebook, ShoppingBag } from "lucide-react";
import { PageHero, PageBody, Section, Callout, Related } from "@/components/content/ContentPage";
import { WHATSAPP_URL, WHATSAPP_NUMBER, FACEBOOK_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Reach Wendy Herbals on WhatsApp for orders, product questions and delivery. Nationwide delivery across Nigeria.",
};

const CHANNELS = [
  {
    icon: MessageCircle,
    title: "WhatsApp",
    detail: WHATSAPP_NUMBER,
    note: "The fastest way to reach us. Orders, questions and delivery are arranged here.",
    href: WHATSAPP_URL,
    external: true,
    primary: true,
  },
  {
    icon: Phone,
    title: "Phone",
    detail: WHATSAPP_NUMBER,
    note: "The same number, if you would rather call than message.",
    href: `tel:${WHATSAPP_NUMBER.replace(/\s/g, "")}`,
    external: false,
  },
  {
    icon: Facebook,
    title: "Facebook",
    detail: "Wendy Herbals",
    note: "Product updates and photographs from the workshop.",
    href: FACEBOOK_URL,
    external: true,
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Talk to us directly."
        intro="Wendy Herbals is a small business and runs on WhatsApp. Messages go straight to the founder, not to a call centre."
      />

      <PageBody>
        <Section>
          <div className="grid sm:grid-cols-3 gap-4">
            {CHANNELS.map((c) => {
              const Icon = c.icon;
              return (
                <a
                  key={c.title}
                  href={c.href}
                  {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className={`group rounded-xl border p-5 transition-colors ${
                    c.primary
                      ? "bg-[#123D2B] border-[#123D2B] text-white hover:bg-[#175C3D]"
                      : "bg-white border-[#123D2B]/12 hover:border-[#C6A667]"
                  }`}
                >
                  <Icon size={18} strokeWidth={1.7} className={c.primary ? "text-[#C6A667]" : "text-[#175C3D]"} />
                  <p className={`mt-3 text-[13px] font-semibold ${c.primary ? "text-white" : "text-[#252B23]"}`}
                    style={{ fontFamily: "var(--font-body)" }}>
                    {c.title}
                  </p>
                  <p className={`text-[13px] mt-0.5 ${c.primary ? "text-[#C6A667]" : "text-[#175C3D]"}`}
                    style={{ fontFamily: "var(--font-body)" }}>
                    {c.detail}
                  </p>
                  <p className={`text-[12px] leading-relaxed mt-2 ${c.primary ? "text-white/65" : "text-[#6b7265]"}`}
                    style={{ fontFamily: "var(--font-body)" }}>
                    {c.note}
                  </p>
                </a>
              );
            })}
          </div>
        </Section>

        <Section title="What to send with your message">
          <p>
            If you are following up an order you have already placed, include your order number
            and the name the order was placed under. That is all we need to find it.
          </p>
          <p>
            If you are asking about a product, tell us which one and what you would like to know.
            For the food spices, which are sold on enquiry rather than at a listed price, ask for
            a quote and we will send the current price.
          </p>
        </Section>

        <Section title="Placing an order">
          <p>
            You do not need to message us to order. Add items to the cart, check out, pay by bank
            transfer to the account shown, and send the receipt on WhatsApp. Full detail is on the{" "}
            <Link href="/faq" className="text-[#175C3D] underline underline-offset-4 decoration-[#C6A667]/50">
              FAQ page
            </Link>.
          </p>
          <Link href="/shop"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#123D2B] text-white text-[13px] font-medium hover:bg-[#175C3D] transition-colors active:scale-[0.98]"
            style={{ fontFamily: "var(--font-body)" }}>
            <ShoppingBag size={15} />
            Browse the shop
          </Link>
        </Section>

        <Callout tone="pending" title="Not published yet">
          <p>
            Wendy Herbals does not currently publish an email address, a shop address or set
            opening hours. Rather than print details that may be wrong, we have left them off.
            WhatsApp reaches us reliably.
          </p>
        </Callout>

        <Related
          links={[
            { label: "About Wendy Herbals", href: "/about" },
            { label: "Delivery Information", href: "/delivery" },
            { label: "Returns & Refunds", href: "/returns" },
            { label: "FAQs", href: "/faq" },
          ]}
        />
      </PageBody>
    </>
  );
}
