import type { OrderStatus } from "./constants";

/**
 * A size the customer picks before buying, each with its own price and SKU.
 * Only the food spices have these so far.
 */
export interface ProductVariant {
  /** Appended to the product SKU, so WH-FS-001 small is WH-FS-001-SM. */
  id: string;
  label: string;
  price: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  category: string;
  subcategory?: string;
  description: string;
  /** null until Wendy supplies the advertised price; UI falls back to an enquiry CTA. */
  price: number | null;
  compare_price?: number;
  images: string[];
  in_stock: boolean;
  stock_count: number;
  size_options?: string[];
  /** When present, price is per variant and `price` is the cheapest of them. */
  variants?: ProductVariant[];
  includes_balm?: boolean;
  ingredients?: string;
  storage_info?: string;
  safety_info?: string;
  nafdac_status?: "pending" | "approved" | "not_applicable";
  nafdac_number?: string;
  is_published: boolean;
  is_enquiry_only: boolean;
  created_at: string;
}

export interface CartItem {
  product_id: string;
  product: Product;
  quantity: number;
  /** A ProductVariant id when the product has variants. */
  size?: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  items: OrderItem[];
  subtotal: number;
  shipping_fee: number;
  total: number;
  status: OrderStatus;
  payment_status: "pending" | "paid" | "failed" | "refunded";
  payment_reference?: string;
  delivery_address: Address;
  notes?: string;
  tracking_ref?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  product_image: string;
  quantity: number;
  unit_price: number;
  size?: string;
}

export interface Address {
  full_name: string;
  phone: string;
  whatsapp_phone: string;
  sms_phone?: string;
  birthday_day?: string;
  birthday_month?: string;
  state: string;
  city: string;
  street: string;
  landmark?: string;
}

export interface Customer {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  total_orders: number;
  total_spent: number;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image?: string;
  category: string;
  is_published: boolean;
  published_at?: string;
  created_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  customer_name: string;
  rating: number;
  comment: string;
  is_approved: boolean;
  created_at: string;
}

export interface ShippingZone {
  id: string;
  name: string;
  states: string[];
  fee: number;
  free_threshold?: number;
  estimated_days: string;
}

export interface SiteSettings {
  business_name: string;
  tagline: string;
  whatsapp: string;
  facebook: string;
  announcement_messages: string[];
  hero_headline: string;
  hero_subtext: string;
  currency: string;
  low_stock_threshold: number;
}

export interface DashboardStats {
  total_sales: number;
  total_orders: number;
  total_customers: number;
  products_in_stock: number;
  low_stock_count: number;
  sales_vs_last_month: number;
  orders_vs_last_month: number;
  customers_vs_last_month: number;
}
