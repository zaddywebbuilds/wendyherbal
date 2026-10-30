import Link from "next/link";
import { Facebook, MessageCircle, Mail } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { FACEBOOK_URL, WHATSAPP_URL, BRAND_PHRASE } from "@/lib/constants";

/**
 * Blog and Order Tracking were removed from these columns: neither has a page
 * behind it, and a footer link to a 404 is worse than no link. Restore them
 * when the blog and customer accounts are built.
 */
const footerLinks = {
  Company: [
    { label: "About Wendy Herbals", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  Shop: [
    { label: "All Products", href: "/shop" },
    { label: "Food Spices", href: "/shop?category=food-spices" },
    { label: "Body Care", href: "/shop?category=body-care" },
    { label: "Women's Wellness", href: "/shop?category=womens-wellness" },
    { label: "Men's Wellness", href: "/shop?category=mens-wellness" },
  ],
  Help: [
    { label: "Delivery Information", href: "/delivery" },
    { label: "Returns & Refunds", href: "/returns" },
    { label: "FAQs", href: "/faq" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms & Conditions", href: "/terms" },
    { label: "Medical Disclaimer", href: "/disclaimer" },
  ],
};

// Resolved once at build rather than per render, so the footer stays static.
const YEAR = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="bg-[#123D2B] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-8">
          {/* Brand col */}
          <div className="lg:col-span-2">
            <Logo variant="light" />
            <p className="mt-4 text-sm text-white/70 leading-relaxed max-w-xs" style={{ fontFamily: "var(--font-body)" }}>
              Natural wellness products, authentic kitchen spices, and botanical personal care from Nigeria.
            </p>
            <p className="mt-3 text-xs text-[#C6A667] italic" style={{ fontFamily: "var(--font-heading)" }}>
              &ldquo;{BRAND_PHRASE}&rdquo;
            </p>

            {/* Social */}
            <div className="flex gap-3 mt-6">
              <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:border-[#C6A667] hover:text-[#C6A667] transition-colors">
                <Facebook size={15} />
              </a>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:border-[#C6A667] hover:text-[#C6A667] transition-colors">
                <MessageCircle size={15} />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-xs font-semibold tracking-widest uppercase text-[#C6A667] mb-4"
                style={{ fontFamily: "var(--font-body)" }}>
                {title}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}
                      className="text-sm text-white/70 hover:text-white transition-colors"
                      style={{ fontFamily: "var(--font-body)" }}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/50" style={{ fontFamily: "var(--font-body)" }}>
            &copy; {YEAR} Wendy Herbals. All rights reserved.
          </p>
          <p className="text-xs text-white/50" style={{ fontFamily: "var(--font-body)" }}>
            Products are not intended to diagnose, treat, cure, or prevent any disease.
          </p>
        </div>
      </div>
    </footer>
  );
}
