import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { PageHero, PageBody, Section, Callout, ContactStrip, Related } from "@/components/content/ContentPage";
import { PRODUCTS } from "@/lib/products";
import { BANK_DETAILS, DELIVERY_NOTE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "FAQs",
  description:
    "How to order from Wendy Herbals, how payment and delivery work, and what our product names do and do not mean.",
  alternates: { canonical: "/faq" },
};

const ENQUIRY_COUNT = PRODUCTS.filter((p) => p.price === null).length;

const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: "How do I place an order?",
    a: (
      <>
        <p>
          Add what you want to the cart and go to checkout. Fill in your name, phone number and
          delivery address, then confirm. You will be given an order number and the bank details
          for payment.
        </p>
        <p>
          Pay by transfer, then send the receipt to us on WhatsApp with your order number. The
          order is confirmed once the payment has been checked.
        </p>
      </>
    ),
  },
  {
    q: "What payment methods do you accept?",
    a: (
      <>
        <p>
          Direct bank transfer only. There is no card payment on this site, and we do not ask for
          card details at any point.
        </p>
        <p>
          Payments go to {BANK_DETAILS.bank}, account {BANK_DETAILS.accountNumber}, in the name{" "}
          {BANK_DETAILS.accountName}. The same details are shown at checkout.
        </p>
      </>
    ),
  },
  {
    q: "Do I need to create an account?",
    a: (
      <p>
        No. Every order is a guest order. We do not ask you to set a password and there is
        nothing to sign in to.
      </p>
    ),
  },
  {
    q: "Is delivery included in the price?",
    a: (
      <>
        <p>{DELIVERY_NOTE}</p>
        <p>
          The way bill depends on where you are and which courier is used, so it is agreed with
          you on WhatsApp rather than calculated automatically at checkout. See{" "}
          <Link href="/delivery" className="text-[#175C3D] underline underline-offset-4">Delivery Information</Link>.
        </p>
      </>
    ),
  },
  {
    q: "Where do you deliver?",
    a: (
      <p>
        Across Nigeria. Delivery outside Nigeria has not been set up, so please ask on WhatsApp
        before ordering from abroad.
      </p>
    ),
  },
  {
    q: `Why do ${ENQUIRY_COUNT} products say "Price on enquiry"?`,
    a: (
      <p>
        Our food spices are not on the printed price list that the rest of the catalogue comes
        from. Rather than guess at a figure, we show an enquiry button. Message us and we will
        send the current price.
      </p>
    ),
  },
  {
    q: "How do I know my order went through?",
    a: (
      <p>
        You will see an order number on screen as soon as you confirm, and the full order is
        carried through to WhatsApp so that both of us have a copy. If anything looks wrong,
        reply on WhatsApp with the order number.
      </p>
    ),
  },
  {
    q: "Your products are named after medical conditions. Does that mean they treat them?",
    a: (
      <>
        <p>
          No. The names describe what a preparation is traditionally associated with, and they
          come from our own price list and from how customers ask for them. They are not a claim
          that the product diagnoses, treats, cures or prevents anything.
        </p>
        <p>
          Please read the{" "}
          <Link href="/disclaimer" className="text-[#175C3D] underline underline-offset-4">Medical Disclaimer</Link>{" "}
          before buying.
        </p>
      </>
    ),
  },
  {
    q: "Can I take these alongside medicine my doctor prescribed?",
    a: (
      <p>
        Ask your doctor or pharmacist first. Herbal preparations can interact with prescribed
        medicine. Do not stop or change a prescription in order to use a herbal product.
      </p>
    ),
  },
  {
    q: "Are your products NAFDAC registered?",
    a: (
      <p>
        We track the regulatory status of each product and will say so on the product page once
        that work is complete. Until then we make no registration claim, and we do not display
        regulatory badges. Items such as honey, shea butter and kitchen spices are ordinary food
        and body-care goods rather than regulated preparations.
      </p>
    ),
  },
  {
    q: "Why do some products have no photograph?",
    a: (
      <p>
        Because we would rather show nothing than show a picture of a different product. Where a
        photograph is missing you will see a plain placeholder marked &ldquo;photo pending&rdquo;.
      </p>
    ),
  },
  {
    q: "Can I change or cancel an order?",
    a: (
      <p>
        Message us on WhatsApp with your order number as soon as you can. If the order has not
        been dispatched we can usually change it.
      </p>
    ),
  },
];

export default function FaqPage() {
  return (
    <>
      <PageHero
        eyebrow="Help"
        title="Frequently asked questions."
        intro="Ordering, payment, delivery, and what our product names do and do not mean. If your question is not here, message us on WhatsApp."
      />

      <PageBody>
        <Section>
          <div className="divide-y divide-[#123D2B]/10 border-y border-[#123D2B]/10">
            {FAQS.map((item) => (
              <details key={item.q} className="group py-4">
                <summary className="flex items-start justify-between gap-4 cursor-pointer list-none">
                  <h2 className="text-[15px] font-semibold text-[#252B23] leading-snug marker:hidden"
                    style={{ fontFamily: "var(--font-body)" }}>
                    {item.q}
                  </h2>
                  <ChevronDown size={17}
                    className="shrink-0 mt-0.5 text-[#175C3D] transition-transform group-open:rotate-180" />
                </summary>
                <div className="mt-3 space-y-3 pr-8 text-[14px] leading-relaxed text-[#4a5247]">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </Section>

        <Callout tone="pending" title="Still being settled">
          <p>
            Delivery timeframes, delivery costs by state and a formal returns window have not been
            fixed yet. They are agreed case by case on WhatsApp in the meantime, and this page
            will be updated once they are set.
          </p>
        </Callout>

        <ContactStrip />

        <Related
          links={[
            { label: "Delivery Information", href: "/delivery" },
            { label: "Returns & Refunds", href: "/returns" },
            { label: "Medical Disclaimer", href: "/disclaimer" },
            { label: "Contact", href: "/contact" },
          ]}
        />
      </PageBody>
    </>
  );
}
