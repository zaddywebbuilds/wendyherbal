import type { Metadata } from "next";
import Link from "next/link";
import { PageHero, PageBody, Section, List, Callout, ContactStrip, Related, EffectiveDate } from "@/components/content/ContentPage";

export const metadata: Metadata = {
  title: "Returns & Refunds",
  description:
    "What to do if an order from Wendy Herbals arrives wrong, damaged or incomplete, and how refunds are handled.",
  alternates: { canonical: "/returns" },
};

const UPDATED = "30 October 2026";

export default function ReturnsPage() {
  return (
    <>
      <PageHero
        eyebrow="Help"
        title="Returns and refunds."
        intro="If something is wrong with your order, tell us straight away on WhatsApp with your order number. Every case is handled directly with you."
      />

      <PageBody>
        <Section title="If your order is wrong, damaged or incomplete">
          <p>
            Message us on WhatsApp as soon as the parcel arrives, with your order number and a
            photograph of what you received. Keep the packaging and the courier paperwork until
            the matter is settled.
          </p>
          <List
            items={[
              "Wrong item sent: we arrange the correct item.",
              "Item damaged in transit: send photographs of the parcel and the contents before discarding anything.",
              "Item missing from the parcel: tell us what is missing against your order number.",
            ]}
          />
        </Section>

        <Section title="Products that cannot be returned once opened">
          <p>
            Herbal preparations, soaps, creams, oils, honey and food spices are consumable and
            personal-care goods. Once a seal is broken we cannot resell an item, and for the
            safety of other customers we cannot take it back unless the problem is with the
            product itself.
          </p>
          <p>
            That does not affect your rights where an item is faulty, damaged or not what you
            ordered.
          </p>
        </Section>

        <Section title="Refunds">
          <p>
            Where a refund is agreed, it is paid by bank transfer to the account the payment came
            from. We do not hold card details and there is no card payment to reverse.
          </p>
        </Section>

        <Callout tone="pending" title="Not fixed yet">
          <p>
            Wendy Herbals has not set a formal returns window, a fixed list of conditions, or a
            stated turnaround for refunds. Rather than publish a policy the business has not
            agreed to, we have described what actually happens today: you raise it on WhatsApp and
            it is handled case by case.
          </p>
          <p>
            If you need certainty before ordering, ask us and we will put the answer in writing on
            WhatsApp.
          </p>
        </Callout>

        <Section title="Your rights under Nigerian law">
          <p>
            Nothing on this page removes any right you have as a consumer under Nigerian law,
            including under the Federal Competition and Consumer Protection Act. Where this page
            and the law differ, the law applies.
          </p>
          <p>
            See also our{" "}
            <Link href="/terms" className="text-[#175C3D] underline underline-offset-4">Terms &amp; Conditions</Link>.
          </p>
        </Section>

        <ContactStrip />

        <EffectiveDate date={UPDATED} />

        <Related
          links={[
            { label: "Delivery Information", href: "/delivery" },
            { label: "FAQs", href: "/faq" },
            { label: "Terms & Conditions", href: "/terms" },
            { label: "Contact", href: "/contact" },
          ]}
        />
      </PageBody>
    </>
  );
}
