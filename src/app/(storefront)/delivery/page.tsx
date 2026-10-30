import type { Metadata } from "next";
import Link from "next/link";
import { PageHero, PageBody, Section, List, Callout, ContactStrip, Related, EffectiveDate } from "@/components/content/ContentPage";
import { DELIVERY_NOTE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Delivery Information",
  description:
    "How Wendy Herbals delivers across Nigeria, how the way bill is agreed, and what happens after you pay.",
};

const UPDATED = "30 October 2026";

export default function DeliveryPage() {
  return (
    <>
      <PageHero
        eyebrow="Help"
        title="Delivery information."
        intro="We deliver across Nigeria. The way bill is arranged with you directly rather than added automatically at checkout."
      />

      <PageBody>
        <Section title="The way bill is not included in the price">
          <Callout tone="note">
            <p>{DELIVERY_NOTE}</p>
          </Callout>
          <p>
            Every price on this site is for the product itself. What it costs to get the parcel to
            you depends on where you are and which courier we use, so it is quoted separately
            rather than guessed at by the website.
          </p>
        </Section>

        <Section title="How it works">
          <List
            items={[
              "Place your order on the site and note the order number you are given.",
              "Send the order number to us on WhatsApp. We confirm the way bill for your location.",
              "Transfer the product total together with the way bill, and send the receipt on WhatsApp.",
              "Once payment is checked, the order is packed and handed to the courier.",
              "We send you the courier details so you can follow the parcel.",
            ]}
          />
          <p>
            If you transfer only the product total, the parcel waits until the way bill is
            settled, so it is worth confirming the figure before you pay.
          </p>
        </Section>

        <Section title="Where we deliver">
          <p>
            Anywhere in Nigeria. Delivery outside Nigeria has not been set up. If you are ordering
            from abroad, message us first so we can tell you whether it is possible before you pay.
          </p>
        </Section>

        <Section title="When your parcel arrives">
          <p>
            Check the parcel against your order while the courier is still with you where that is
            possible. If anything is missing, damaged or not what you ordered, tell us on WhatsApp
            the same day and keep the packaging. See{" "}
            <Link href="/returns" className="text-[#175C3D] underline underline-offset-4">Returns &amp; Refunds</Link>.
          </p>
        </Section>

        <Callout tone="pending" title="Not fixed yet">
          <p>
            Delivery timeframes, a published price per state and the courier partners we use have
            not been settled. Until they are, every way bill is quoted on WhatsApp for your
            specific location. We would rather quote you a real figure than publish an estimate
            that turns out to be wrong.
          </p>
        </Callout>

        <ContactStrip />

        <EffectiveDate date={UPDATED} />

        <Related
          links={[
            { label: "Returns & Refunds", href: "/returns" },
            { label: "FAQs", href: "/faq" },
            { label: "Terms & Conditions", href: "/terms" },
            { label: "Contact", href: "/contact" },
          ]}
        />
      </PageBody>
    </>
  );
}
