export const SITE_NAME = "Wendy Herbals";
export const SITE_TAGLINE = "Rooted in Nature. Inspired by Wellness.";
export const SITE_DESCRIPTION = "Premium botanical wellness, natural body care and authentic kitchen spices from Wendy Herbals Nigeria.";
export const WHATSAPP_NUMBER = "+2349062104172";
export const WHATSAPP_URL = `https://wa.me/2349062104172`;
export const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=61588005566206";
export const BRAND_PHRASE = "We Treat, God Heals.";

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Women's Wellness", href: "/shop?category=womens-wellness" },
  { label: "Men's Wellness", href: "/shop?category=mens-wellness" },
  { label: "Body Care", href: "/shop?category=body-care" },
  { label: "Food Spices", href: "/shop?category=food-spices" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const ANNOUNCEMENT_MESSAGES = [
  "Natural Wellness & Everyday Essentials | Delivery Across Nigeria",
  "Welcome to Wendy Herbals — Nature's Goodness, Beautifully Delivered",
  "Explore Our Botanical Collections & Authentic Food Spices",
];

export const COLLECTIONS = [
  {
    id: "womens-wellness",
    title: "Women's Wellness",
    description: "Herbal support for fertility, hormonal balance, and reproductive health.",
    href: "/shop?category=womens-wellness",
    color: "#F7F4E9",
  },
  {
    id: "mens-wellness",
    title: "Men's Wellness",
    description: "Botanical formulations for male reproductive health and vitality.",
    href: "/shop?category=mens-wellness",
    color: "#EFE9DD",
  },
  {
    id: "herbal-collections",
    title: "Herbal Collections",
    description: "Carefully sourced herbs and botanical preparations.",
    href: "/shop?category=herbal-collections",
    color: "#A8B99C",
  },
  {
    id: "body-care",
    title: "Natural Body Care",
    description: "Soaps, creams, oils and personal care crafted from natural ingredients.",
    href: "/shop?category=body-care",
    color: "#C6A667",
  },
  {
    id: "food-spices",
    title: "Food Spices",
    description: "Authentic Nigerian kitchen spices and seasonings for every meal.",
    href: "/shop?category=food-spices",
    color: "#175C3D",
  },
];

export const FORMAT_NGN = (amount: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(amount);

/**
 * Bank details as printed on Wendy's own price list. Payment is by direct
 * transfer; the customer then sends the receipt on WhatsApp and admin marks
 * the order paid after verifying it. No card gateway is active.
 */
export const BANK_DETAILS = {
  bank: "Access Bank",
  accountNumber: "1232465038",
  accountName: "Juliet Nneka Ogbonna",
} as const;

export const DELIVERY_NOTE =
  "The price list does not cover the way bill; please ensure it is included in your payment.";

export const ORDER_STATUSES = ["pending", "confirmed", "processing", "dispatched", "delivered", "cancelled", "refunded"] as const;
export type OrderStatus = typeof ORDER_STATUSES[number];

export const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "#F59E0B",
  confirmed: "#3B82F6",
  processing: "#8B5CF6",
  dispatched: "#6366F1",
  delivered: "#123D2B",
  cancelled: "#EF4444",
  refunded: "#6B7280",
};
