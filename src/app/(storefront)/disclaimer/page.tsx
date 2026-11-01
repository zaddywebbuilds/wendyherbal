import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { PageBody, Section, List, Callout, Related, EffectiveDate } from "@/components/content/ContentPage";
import { WHATSAPP_URL, WHATSAPP_NUMBER } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Medical Disclaimer",
  description:
    "Wendy Herbals products are not medicines and are not intended to diagnose, treat, cure or prevent any disease. Read this before buying or using them.",
  alternates: { canonical: "/disclaimer" },
};

const UPDATED = "30 October 2026";

export default function DisclaimerPage() {
  return (
    <>
      {/* Given what the products are named after, this page leads with the
          warning rather than with brand furniture. */}
      <section className="bg-[#123D2B]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          <div className="flex items-center gap-2.5 mb-4">
            <AlertTriangle size={17} className="text-[#C6A667]" strokeWidth={2} />
            <p className="text-[10.5px] font-semibold tracking-[0.22em] uppercase text-[#C6A667]"
              style={{ fontFamily: "var(--font-body)" }}>
              Please read
            </p>
          </div>
          <h1 className="text-[2.1rem] lg:text-[3rem] leading-[1.08] text-white font-medium"
            style={{ fontFamily: "var(--font-heading)" }}>
            Medical disclaimer.
          </h1>
          <span className="block w-14 h-px bg-[#C6A667] mt-5" />
          <p className="mt-5 text-[15px] leading-relaxed text-white/80 max-w-2xl"
            style={{ fontFamily: "var(--font-body)" }}>
            Wendy Herbals products are not medicines. They are not intended to diagnose, treat,
            cure or prevent any disease, and nothing on this website is medical advice.
          </p>
        </div>
      </section>

      <PageBody>
        <Section title="What our product names mean">
          <p>
            Many of our products are named after a medical condition, for example the hormone,
            fertility, infection and digestive preparations in our herbal collections. Those names
            come from our own price list and from the words customers use when they ask for them.
          </p>
          <p className="font-semibold text-[#252B23]">
            A name is not a claim. It does not mean the product treats that condition, and it does
            not mean the product has been tested or approved for it.
          </p>
          <p>
            We publish no testimonials, no success rates, no before-and-after claims and no star
            ratings, because we have no verified evidence to offer you and would not invent any.
          </p>
        </Section>

        <Section title="Speak to a qualified professional first">
          <p>
            Talk to a doctor, pharmacist or other qualified healthcare professional before using
            any herbal product, and especially before using one if any of the following apply to
            you:
          </p>
          <List
            items={[
              "You are pregnant, trying to conceive, or breastfeeding.",
              "You are taking prescribed medicine of any kind. Herbal preparations can interact with medicines, including contraceptives, blood thinners, blood pressure and diabetes medication.",
              "You live with a long-term condition such as diabetes, high blood pressure, or kidney, liver or heart disease.",
              "You are due to have surgery, or have had surgery recently.",
              "You are buying for a child, or for an elderly or frail person.",
              "You have known allergies, or have reacted to a herbal product before.",
            ]}
          />
          <Callout tone="caution" title="Never stop prescribed treatment to use a herbal product">
            <p>
              Do not stop, reduce or delay medicine a doctor has prescribed, and do not postpone
              seeking medical attention, because of something you have bought here or read on this
              site.
            </p>
          </Callout>
        </Section>

        <Section title="In an emergency">
          <p className="font-semibold text-[#252B23]">
            If you or someone else is seriously unwell, go to a hospital or call the emergency
            services. Do not rely on a herbal product and do not wait to hear back from us.
          </p>
        </Section>

        <Section title="Individual responses differ">
          <p>
            People respond to herbal preparations differently. What one person tolerates well may
            not suit you. Start cautiously, follow any instructions supplied with the product, and
            keep products out of reach of children.
          </p>
          <p>
            If you have a reaction, stop using the product immediately, seek medical attention,
            and tell us on{" "}
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
              className="text-[#175C3D] underline underline-offset-4">
              WhatsApp at {WHATSAPP_NUMBER}
            </a>{" "}
            so we know about it.
          </p>
        </Section>

        <Section title="Ingredients and allergies">
          <p>
            If you need to know what is in a particular preparation before you buy, ask us on
            WhatsApp and we will tell you what we know about that product. If we are not certain,
            we will say so rather than guess.
          </p>
        </Section>

        <Section title="Regulatory status">
          <p>
            We record the regulatory status of each product in our catalogue and will state it on
            the product page once that work is complete. Until then we make no claim that any
            herbal preparation is registered, and we display no regulatory badges or approval
            marks.
          </p>
          <p>
            Ordinary food and body-care goods in our range, such as honey, shea butter, sea salt
            and kitchen spices, are sold as food and cosmetic products rather than as
            preparations for any condition.
          </p>
        </Section>

        <Section title="Your agreement">
          <p>
            By buying from this website you confirm that you have read this page, that you are
            buying of your own accord, and that you will seek qualified medical advice where it is
            needed. This disclaimer forms part of our{" "}
            <Link href="/terms" className="text-[#175C3D] underline underline-offset-4">Terms &amp; Conditions</Link>.
          </p>
        </Section>

        <EffectiveDate date={UPDATED} />

        <Related
          links={[
            { label: "Terms & Conditions", href: "/terms" },
            { label: "Privacy Policy", href: "/privacy" },
            { label: "FAQs", href: "/faq" },
            { label: "Contact", href: "/contact" },
          ]}
        />
      </PageBody>
    </>
  );
}
