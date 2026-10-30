import type { Metadata } from "next";
import Link from "next/link";
import { PageHero, PageBody, Section, List, Callout, Related, EffectiveDate } from "@/components/content/ContentPage";
import { BANK_DETAILS, WHATSAPP_NUMBER, SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "The terms you are agreeing to when you order from Wendy Herbals: prices, payment, delivery, availability and governing law.",
};

const UPDATED = "30 October 2026";

export default function TermsPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Terms and conditions."
        intro="These terms apply when you order from this website. They are written plainly on purpose."
      />

      <PageBody>
        <Section title="Who you are buying from">
          <p>
            You are buying from {SITE_NAME}, a herbal wellness and food spice business operating
            in Nigeria. We can be reached on WhatsApp at {WHATSAPP_NUMBER}.
          </p>
        </Section>

        <Section title="Prices">
          <p>
            All prices are in Nigerian naira. The price shown is for the product only, and the way
            bill is quoted separately and added to what you transfer. See{" "}
            <Link href="/delivery" className="text-[#175C3D] underline underline-offset-4">Delivery Information</Link>.
          </p>
          <p>
            Some products are shown as &ldquo;price on enquiry&rdquo; rather than carrying a
            figure. Those cannot be bought through the cart; message us for a quote and the price
            is agreed before you pay.
          </p>
          <p>
            Prices can change. The price that applies is the one shown when you place the order.
          </p>
        </Section>

        <Section title="Placing an order">
          <p>
            Submitting the checkout form is an offer to buy, not a completed sale. The sale is
            made when we have checked your payment and confirmed the order on WhatsApp. If we
            cannot fulfil an order we will tell you and return anything you have paid.
          </p>
        </Section>

        <Section title="Availability">
          <p>
            Stock is not counted live on this website, so an item shown as available may turn out
            to be unavailable when we pack your order. If that happens we will offer you the
            choice of waiting, swapping it, or being refunded for that item.
          </p>
        </Section>

        <Section title="Payment">
          <p>
            Payment is by direct bank transfer to {BANK_DETAILS.bank}, account{" "}
            {BANK_DETAILS.accountNumber}, in the name {BANK_DETAILS.accountName}. The site takes
            no card payments and we will never ask you for card details.
          </p>
          <p>
            Send your receipt on WhatsApp quoting your order number so the payment can be matched
            to the order.
          </p>
        </Section>

        <Section title="Product information">
          <p>
            Many herbal products are named after the concern they are traditionally associated
            with. Those names are not claims of treatment or cure, and nothing on this site is
            medical advice.
          </p>
          <Callout tone="caution" title="Read before you buy">
            <p>
              Our{" "}
              <Link href="/disclaimer" className="underline underline-offset-4">Medical Disclaimer</Link>{" "}
              forms part of these terms. By ordering you confirm you have read it.
            </p>
          </Callout>
          <p>
            We try to describe products accurately. Packaging and appearance can change, and
            photographs are an illustration rather than a guarantee of exact appearance.
          </p>
        </Section>

        <Section title="Delivery and returns">
          <p>
            Delivery is handled as described on our{" "}
            <Link href="/delivery" className="text-[#175C3D] underline underline-offset-4">Delivery Information</Link>{" "}
            page, and problems with an order are handled as described on our{" "}
            <Link href="/returns" className="text-[#175C3D] underline underline-offset-4">Returns &amp; Refunds</Link>{" "}
            page. Both form part of these terms.
          </p>
        </Section>

        <Section title="Using this website">
          <List
            items={[
              "Give accurate delivery details. We cannot be responsible for a parcel sent to an address you typed incorrectly.",
              "Do not attempt to interfere with the site, its admin area or other customers' orders.",
              "The text, photographs and design on this site belong to Wendy Herbals and may not be copied for commercial use.",
            ]}
          />
        </Section>

        <Section title="Our responsibility to you">
          <p>
            We are responsible for supplying the products you ordered, in the condition described,
            and for handling your details as set out in our{" "}
            <Link href="/privacy" className="text-[#175C3D] underline underline-offset-4">Privacy Policy</Link>.
          </p>
          <p>
            We are not responsible for how an individual responds to a herbal preparation, which
            is why we ask you to read the Medical Disclaimer and speak to a qualified healthcare
            professional. Nothing in these terms limits any liability that cannot lawfully be
            limited, including liability for death or personal injury caused by negligence.
          </p>
        </Section>

        <Section title="Governing law">
          <p>
            These terms are governed by the laws of the Federal Republic of Nigeria, and nothing
            in them removes any right you have under Nigerian consumer law.
          </p>
        </Section>

        <Callout tone="pending" title="Not settled yet">
          <p>
            The registered legal name of the business, its RC number and registered address, and
            the specific courts that would hear a dispute, are not published here yet. They will
            be added once confirmed. If you need them before ordering, ask us on WhatsApp.
          </p>
        </Callout>

        <Section title="Changes to these terms">
          <p>
            These terms may be updated. The version that applies to your order is the one
            published when you placed it.
          </p>
        </Section>

        <EffectiveDate date={UPDATED} />

        <Related
          links={[
            { label: "Privacy Policy", href: "/privacy" },
            { label: "Medical Disclaimer", href: "/disclaimer" },
            { label: "Returns & Refunds", href: "/returns" },
            { label: "Contact", href: "/contact" },
          ]}
        />
      </PageBody>
    </>
  );
}
