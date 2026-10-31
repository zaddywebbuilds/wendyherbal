import type { Metadata } from "next";
import Link from "next/link";
import { PageHero, PageBody, Section, List, Callout, Related, EffectiveDate } from "@/components/content/ContentPage";
import { WHATSAPP_URL, WHATSAPP_NUMBER } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "What Wendy Herbals collects when you order, where it is stored, who else sees it, and your rights under the Nigeria Data Protection Act.",
  alternates: { canonical: "/privacy" },
};

const UPDATED = "30 October 2026";

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Privacy policy."
        intro="This page describes exactly what this website collects, where it goes, and what we do not do. It is written against how the site actually works rather than from a template."
      />

      <PageBody>
        <Section title="What we collect">
          <p>When you place an order we ask for:</p>
          <List
            items={[
              "Your full name and phone number. Both are required, because the order is confirmed on WhatsApp.",
              "Your email address, if you choose to give one.",
              "Your delivery address: state, city or town, street address and an optional landmark.",
              "Any order notes you add.",
              "Whether you want to hear about new products, which is an optional tick box.",
            ]}
          />
          <p>
            Alongside that we keep the contents of the order itself: the products, the quantities
            and the total.
          </p>
          <p>
            If you sign up to the newsletter without ordering, we collect your email address and
            the date you consented, and nothing else.
          </p>
        </Section>

        <Section title="Why we collect it">
          <p>
            To pack and deliver your order, to confirm your payment, to reach you if there is a
            problem with it, and to keep a record of what was sold. If you ticked the updates box,
            also to tell you about new products. That is the whole purpose.
          </p>
        </Section>

        <Section title="Where it is stored">
          <p>
            Orders are written to a Google Sheet in Wendy Herbals&apos; own Google account. Two
            tabs are used: one for orders and one for customers. Google processes and stores that
            spreadsheet on our behalf under its own terms.
          </p>
          <p>
            Newsletter sign-ups, where newsletter storage is switched on, are held in a separate
            database used for nothing else.
          </p>
        </Section>

        <Section title="Who else sees it">
          <List
            items={[
              "Google, as the provider of the spreadsheet the orders are written to.",
              "The company that hosts this website.",
              "The courier delivering your parcel, who is given your name, phone number and address.",
              "Our bank, which sees the payment reference you use when you transfer.",
            ]}
          />
          <p>
            Nobody else. We do not sell your details, we do not rent them, and we do not pass them
            to anyone for their own marketing.
          </p>
        </Section>

        <Section title="Cookies and tracking">
          <p>
            This site runs no analytics, no advertising pixels and no third-party trackers. There
            is no cookie banner because there is nothing to consent to.
          </p>
          <p>Two things are kept in your own browser and never sent to us:</p>
          <List
            items={[
              <>
                <code className="text-[13px] bg-[#F7F4E9] px-1.5 py-0.5 rounded">wendy-herbals-cart</code>
                {" "}holds your basket so it survives a page refresh.
              </>,
              <>
                <code className="text-[13px] bg-[#F7F4E9] px-1.5 py-0.5 rounded">wendy-herbals-wishlist</code>
                {" "}holds anything you have saved.
              </>,
            ]}
          />
          <p>
            Clearing your browser data removes both. A single cookie is used to keep the shop
            owner signed in to the private admin area; it is never set for customers.
          </p>
        </Section>

        <Section title="Your rights">
          <p>
            Under the Nigeria Data Protection Act 2023 you can ask us to show you what we hold
            about you, correct it, delete it, stop using it for updates, or withdraw a consent you
            gave earlier. You can also complain to the Nigeria Data Protection Commission.
          </p>
          <p>
            To do any of those, message{" "}
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
              className="text-[#175C3D] underline underline-offset-4">
              {WHATSAPP_NUMBER}
            </a>{" "}
            with the name and phone number you ordered under. Asking us to delete your details
            does not undo an order already placed, and we may need to keep a record of the sale
            itself.
          </p>
        </Section>

        <Callout tone="pending" title="Not settled yet">
          <p>
            Two things on this page are still being finalised: how long order records are kept,
            and the registered legal name and address of the business as data controller. Both
            will be added here once confirmed. In the meantime, WhatsApp is the way to reach us
            about anything on this page.
          </p>
        </Callout>

        <Section title="Children">
          <p>
            This shop is not intended for use by anyone under 18, and we do not knowingly collect
            details from children.
          </p>
        </Section>

        <Section title="Changes">
          <p>
            If this policy changes, the date below changes with it. Material changes will be
            described on this page rather than made quietly.
          </p>
        </Section>

        <EffectiveDate date={UPDATED} />

        <Related
          links={[
            { label: "Terms & Conditions", href: "/terms" },
            { label: "Medical Disclaimer", href: "/disclaimer" },
            { label: "Contact", href: "/contact" },
          ]}
        />
      </PageBody>
    </>
  );
}
