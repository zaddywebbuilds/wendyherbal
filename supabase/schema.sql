-- Wendy Herbals — customers, orders and newsletter.
-- Run in the Supabase SQL editor, then set the env vars from .env.example.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- customers
create table if not exists public.customers (
  id            uuid primary key default gen_random_uuid(),
  full_name     text not null,
  phone         text not null,
  email         text,
  state         text,
  city          text,

  -- Explicit opt-in for marketing. Orders are transactional and do NOT imply
  -- consent, so this is stored separately and defaults to false.
  marketing_consent     boolean not null default false,
  marketing_consent_at  timestamptz,

  first_order_at timestamptz,
  last_order_at  timestamptz,
  total_orders   integer not null default 0,
  total_spent    numeric(12,2) not null default 0,
  notes          text,
  created_at     timestamptz not null default now()
);

-- One record per person. Phone is the reliable identifier in this market.
create unique index if not exists customers_phone_key on public.customers (phone);
create index if not exists customers_email_idx   on public.customers (email);
create index if not exists customers_consent_idx on public.customers (marketing_consent)
  where marketing_consent = true;

-- ------------------------------------------------------------------ orders
create table if not exists public.orders (
  id             uuid primary key default gen_random_uuid(),
  order_number   text not null unique,
  customer_id    uuid references public.customers (id) on delete set null,

  customer_name  text not null,
  customer_phone text not null,
  customer_email text,

  subtotal       numeric(12,2) not null,
  shipping_fee   numeric(12,2) not null default 0,
  total          numeric(12,2) not null,

  status         text not null default 'pending'
                 check (status in ('pending','confirmed','processing','dispatched','delivered','cancelled','refunded')),
  payment_method text not null default 'bank_transfer',
  payment_status text not null default 'awaiting_payment'
                 check (payment_status in ('awaiting_payment','paid','failed','refunded')),
  payment_reference text,
  receipt_url    text,

  delivery_state text,
  delivery_city  text,
  delivery_street text,
  delivery_landmark text,
  notes          text,
  tracking_ref   text,

  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists orders_customer_idx on public.orders (customer_id);
create index if not exists orders_status_idx   on public.orders (status);
create index if not exists orders_created_idx  on public.orders (created_at desc);

-- ------------------------------------------------------------- order items
create table if not exists public.order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references public.orders (id) on delete cascade,
  product_sku  text not null,
  product_name text not null,
  quantity     integer not null check (quantity > 0),
  unit_price   numeric(12,2) not null,
  size         text
);

create index if not exists order_items_order_idx on public.order_items (order_id);

-- ------------------------------------------------------------- newsletter
create table if not exists public.newsletter_subscriptions (
  id           uuid primary key default gen_random_uuid(),
  email        text not null unique,
  consented_at timestamptz not null default now(),
  unsubscribed_at timestamptz
);

-- --------------------------------------------------------------- triggers
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists orders_touch_updated_at on public.orders;
create trigger orders_touch_updated_at
  before update on public.orders
  for each row execute function public.touch_updated_at();

-- Keep customer lifetime figures accurate from verified payments only.
create or replace function public.refresh_customer_totals()
returns trigger language plpgsql as $$
begin
  if new.customer_id is null then
    return new;
  end if;

  update public.customers c
     set total_orders = (
           select count(*) from public.orders o
            where o.customer_id = c.id and o.payment_status = 'paid'),
         total_spent = (
           select coalesce(sum(o.total), 0) from public.orders o
            where o.customer_id = c.id and o.payment_status = 'paid'),
         last_order_at  = greatest(coalesce(c.last_order_at, new.created_at), new.created_at),
         first_order_at = least(coalesce(c.first_order_at, new.created_at), new.created_at)
   where c.id = new.customer_id;

  return new;
end $$;

drop trigger if exists orders_refresh_customer_totals on public.orders;
create trigger orders_refresh_customer_totals
  after insert or update of payment_status, total on public.orders
  for each row execute function public.refresh_customer_totals();

-- ------------------------------------------------------------------- RLS
-- Everything is private. The storefront writes through a server route using the
-- service-role key; the browser never reads these tables directly.
alter table public.customers                enable row level security;
alter table public.orders                   enable row level security;
alter table public.order_items              enable row level security;
alter table public.newsletter_subscriptions enable row level security;

-- No permissive policies are defined on purpose: with RLS on and no policy,
-- the anon key can neither read nor write. Add admin policies when admin auth
-- is wired, e.g. using auth.jwt() ->> 'role' = 'admin'.
