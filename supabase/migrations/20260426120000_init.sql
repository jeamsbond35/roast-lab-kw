-- نفّذ من Supabase → SQL Editor (أو: supabase db push)
-- جداول: محامص، ماركات معدات، منتجات، عملاء، طلبات، سطور الطلب، عرض تقارير

-- === roasters ===
create table if not exists public.roasters (
  slug text primary key,
  name text not null,
  origin text not null default '',
  description text not null default '',
  logo text
);

-- === equipment_brands ===
create table if not exists public.equipment_brands (
  slug text primary key,
  name text not null,
  description text,
  logo text
);

-- === products (متوافق مع نموذج المنتج في الأدمن) ===
create table if not exists public.products (
  id text primary key,
  category text not null,
  name text not null,
  roaster_slug text not null default '',
  roaster text not null default '',
  price numeric(12,4) not null,
  cost numeric(12,4),
  weight text,
  img text not null,
  tag text,
  details text,
  qty int,
  coffee_type text,
  coffee_origin text,
  altitude text,
  variety text,
  process text,
  notes text,
  hidden boolean not null default false,
  brand_slug text,
  brand text,
  equipment_type text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- === customers ===
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  phone text not null unique,
  full_name text not null,
  email text,
  city text not null,
  block text not null,
  street text not null,
  avenue text not null default '',
  house text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- === orders ===
create table if not exists public.orders (
  id text primary key,
  customer_id uuid not null references public.customers (id) on delete restrict,
  order_date timestamptz not null,
  subtotal numeric(12,4) not null,
  shipping numeric(12,4) not null,
  total numeric(12,4) not null,
  payment text not null,
  status text not null default 'pending',
  notes text,
  address jsonb
);

-- === order_line_items ===
create table if not exists public.order_line_items (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.orders (id) on delete cascade,
  product_id text not null,
  name text not null,
  roaster text not null,
  price numeric(12,4) not null,
  qty int not null,
  weight text,
  img text
);

create index if not exists idx_order_line_items_order on public.order_line_items (order_id);
create index if not exists idx_orders_customer on public.orders (customer_id);
create index if not exists idx_orders_date on public.orders (order_date desc);

create or replace view public.sales_by_product as
select
  product_id,
  name,
  roaster,
  sum(qty) as total_qty,
  sum(price * qty) as line_revenue
from public.order_line_items
group by product_id, name, roaster;

-- === RLS (لتطبيق Vite بالمفتاح العام — قيّد لاحقاً في الإنتاج) ===
alter table public.roasters enable row level security;
alter table public.equipment_brands enable row level security;
alter table public.products enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_line_items enable row level security;

drop policy if exists "anon all roasters" on public.roasters;
drop policy if exists "anon all brands" on public.equipment_brands;
drop policy if exists "anon all products" on public.products;
drop policy if exists "anon all customers" on public.customers;
drop policy if exists "anon all orders" on public.orders;
drop policy if exists "anon all order_line_items" on public.order_line_items;

create policy "anon all roasters" on public.roasters for all to anon, authenticated
  using (true) with check (true);
create policy "anon all brands" on public.equipment_brands for all to anon, authenticated
  using (true) with check (true);
create policy "anon all products" on public.products for all to anon, authenticated
  using (true) with check (true);
create policy "anon all customers" on public.customers for all to anon, authenticated
  using (true) with check (true);
create policy "anon all orders" on public.orders for all to anon, authenticated
  using (true) with check (true);
create policy "anon all order_line_items" on public.order_line_items for all to anon, authenticated
  using (true) with check (true);

grant select on public.sales_by_product to anon, authenticated;
