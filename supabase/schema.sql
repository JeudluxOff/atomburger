-- Run this file once in the Supabase SQL editor.
create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  "firstName" text not null default '',
  "lastName" text not null default '',
  phone text default '',
  address text default '',
  role_type text not null default 'customer' check (role_type in ('customer', 'employee')),
  role text,
  permissions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists menu (
  id text primary key, category text not null, name text not null, description text, price numeric(10,2) not null,
  "imageUrl" text default '', badge text default '', stock integer not null default 50, available boolean not null default true, featured boolean not null default false, created_at timestamptz not null default now()
);
create table if not exists restaurants (
  id text primary key, name text not null, hours text, phone text, x numeric, y numeric, active boolean default true, created_at timestamptz not null default now()
);
create table if not exists promotions (
  id text primary key, title text not null, offer text, description text, active boolean default true, created_at timestamptz not null default now()
);
create table if not exists staff (
  id text primary key, auth_id uuid references auth.users(id) on delete cascade, username text unique, email text unique,
  "firstName" text not null, "lastName" text not null, role text not null, permissions jsonb default '["calendar","orders"]'::jsonb,
  position text default '', restaurant text default '', phone text default '', iban text default '', created_at timestamptz not null default now()
);
create table if not exists events (
  id text primary key, title text not null, date date not null, start time, "end" time, type text, location text, notes text,
  "authorId" text, created_at timestamptz not null default now()
);
create table if not exists orders (
  id text primary key, "customerId" uuid references auth.users(id), "customerName" text not null, phone text not null, address text not null,
  "markerX" numeric not null, "markerY" numeric not null, note text, status text not null default 'Nouvelle', "assignedTo" text,
  paid boolean not null default false, items jsonb not null, total numeric(10,2) not null, "createdAt" timestamptz not null default now(), created_at timestamptz not null default now()
);
create table if not exists announcements (
  id text primary key, title text not null, body text not null, priority text, date timestamptz default now(), created_at timestamptz not null default now()
);
create table if not exists documents (
  id text primary key, title text not null, type text, access text, url text, created_at timestamptz not null default now()
);
create table if not exists settings (
  id text primary key default 'global', "acceptingOrders" boolean not null default true, created_at timestamptz not null default now()
);
create table if not exists time_entries (
  id text primary key, "employeeId" text not null, date date not null, hours numeric(5,2) not null check (hours > 0 and hours <= 24),
  comment text default '', "createdAt" timestamptz not null default now(), created_at timestamptz not null default now()
);
create table if not exists cash_entries (
  id text primary key,
  "employeeId" text not null,
  "employeeName" text not null default '',
  date date not null,
  amount numeric(10,2) not null check (amount > 0),
  method text not null default 'Especes',
  note text default '',
  "createdAt" timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create table if not exists applications (
  id text primary key,
  "fullName" text not null,
  phone text not null,
  role text not null,
  restaurant text default '',
  message text not null,
  status text not null default 'Nouvelle',
  "createdAt" timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Safe upgrades when the schema already existed before this version.
alter table profiles add column if not exists address text default '';
alter table staff add column if not exists position text default '';
alter table staff add column if not exists restaurant text default '';
alter table staff add column if not exists phone text default '';
alter table staff add column if not exists iban text default '';
alter table menu add column if not exists "imageUrl" text default '';
alter table orders add column if not exists paid boolean not null default false;

create or replace function public.is_employee() returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from profiles where id = auth.uid() and role_type = 'employee');
$$;
create or replace function public.is_manager() returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from profiles where id = auth.uid() and role_type = 'employee' and permissions ? 'admin');
$$;

alter table profiles enable row level security;
alter table menu enable row level security;
alter table restaurants enable row level security;
alter table promotions enable row level security;
alter table staff enable row level security;
alter table events enable row level security;
alter table orders enable row level security;
alter table announcements enable row level security;
alter table documents enable row level security;
alter table settings enable row level security;
alter table time_entries enable row level security;
alter table cash_entries enable row level security;
alter table applications enable row level security;

drop policy if exists "public reads menu" on menu;
drop policy if exists "public reads restaurants" on restaurants;
drop policy if exists "public reads promotions" on promotions;
drop policy if exists "public reads settings" on settings;
drop policy if exists "employee manages menu" on menu;
drop policy if exists "employee manages restaurants" on restaurants;
drop policy if exists "employee manages promotions" on promotions;
drop policy if exists "manager manages settings" on settings;
drop policy if exists "profile reads own" on profiles;
drop policy if exists "profile updates own" on profiles;
drop policy if exists "manager updates customers" on profiles;
drop policy if exists "employees read staff" on staff;
drop policy if exists "managers update staff" on staff;
drop policy if exists "managers delete staff" on staff;
drop policy if exists "employees read events" on events;
drop policy if exists "employees create events" on events;
drop policy if exists "employees update events" on events;
drop policy if exists "managers delete events" on events;
drop policy if exists "customers create orders" on orders;
drop policy if exists "customers read own orders" on orders;
drop policy if exists "employees update orders" on orders;
drop policy if exists "employees read hours" on time_entries;
drop policy if exists "employees add hours" on time_entries;
drop policy if exists "managers manage hours" on time_entries;
drop policy if exists "employees read cash entries" on cash_entries;
drop policy if exists "employees add cash entries" on cash_entries;
drop policy if exists "managers manage cash entries" on cash_entries;
drop policy if exists "employees read announcements" on announcements;
drop policy if exists "managers manage announcements" on announcements;
drop policy if exists "employees read documents" on documents;
drop policy if exists "managers manage documents" on documents;
drop policy if exists "public creates applications" on applications;
drop policy if exists "managers read applications" on applications;
drop policy if exists "managers update applications" on applications;
drop policy if exists "managers delete applications" on applications;

create policy "public reads menu" on menu for select using (true);
create policy "public reads restaurants" on restaurants for select using (true);
create policy "public reads promotions" on promotions for select using (true);
create policy "public reads settings" on settings for select using (true);
create policy "employee manages menu" on menu for all using (is_manager()) with check (is_manager());
create policy "employee manages restaurants" on restaurants for all using (is_manager()) with check (is_manager());
create policy "employee manages promotions" on promotions for all using (is_manager()) with check (is_manager());
create policy "manager manages settings" on settings for all using (is_manager()) with check (is_manager());
create policy "profile reads own" on profiles for select using (id = auth.uid() or is_employee());
create policy "profile updates own" on profiles for update using (id = auth.uid());
create policy "manager updates customers" on profiles for update using (is_manager());
create policy "employees read staff" on staff for select using (is_employee());
create policy "managers update staff" on staff for update using (is_manager()) with check (is_manager());
create policy "managers delete staff" on staff for delete using (is_manager());
create policy "employees read events" on events for select using (is_employee());
create policy "employees create events" on events for insert with check (is_employee());
create policy "employees update events" on events for update using (is_employee());
create policy "managers delete events" on events for delete using (is_manager());
create policy "customers create orders" on orders for insert with check (auth.uid() = "customerId");
create policy "customers read own orders" on orders for select using (auth.uid() = "customerId" or is_employee());
create policy "employees update orders" on orders for update using (is_employee());
create policy "employees read hours" on time_entries for select using (is_employee());
create policy "employees add hours" on time_entries for insert with check (is_employee());
create policy "managers manage hours" on time_entries for all using (is_manager()) with check (is_manager());
create policy "employees read cash entries" on cash_entries for select using (is_employee());
create policy "employees add cash entries" on cash_entries for insert with check (is_employee());
create policy "managers manage cash entries" on cash_entries for all using (is_manager()) with check (is_manager());
create policy "employees read announcements" on announcements for select using (is_employee());
create policy "managers manage announcements" on announcements for all using (is_manager()) with check (is_manager());
create policy "employees read documents" on documents for select using (is_employee());
create policy "managers manage documents" on documents for all using (is_manager()) with check (is_manager());
create policy "public creates applications" on applications for insert with check (true);
create policy "managers read applications" on applications for select using (is_manager());
create policy "managers update applications" on applications for update using (is_manager()) with check (is_manager());
create policy "managers delete applications" on applications for delete using (is_manager());

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, email, "firstName", "lastName", phone, role_type, role, permissions)
  values (
    new.id, new.email,
    coalesce(new.raw_user_meta_data->>'first_name', ''), coalesce(new.raw_user_meta_data->>'last_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''), coalesce(new.raw_user_meta_data->>'role_type', 'customer'),
    new.raw_user_meta_data->>'role', coalesce(new.raw_user_meta_data->'permissions', '[]'::jsonb)
  );
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.decrement_menu_stock_from_order()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  line jsonb;
  item_id text;
  qty integer;
begin
  for line in select * from jsonb_array_elements(coalesce(new.items, '[]'::jsonb))
  loop
    item_id := line->>'id';
    qty := greatest(0, coalesce((line->>'quantity')::integer, 0));
    if item_id is not null and qty > 0 then
      update public.menu
      set stock = greatest(0, stock - qty),
          available = case when greatest(0, stock - qty) = 0 then false else available end
      where id = item_id;
    end if;
  end loop;
  return new;
end;
$$;

drop trigger if exists decrement_menu_stock_after_order on public.orders;
create trigger decrement_menu_stock_after_order
after insert on public.orders
for each row
execute function public.decrement_menu_stock_from_order();

insert into settings (id) values ('global') on conflict (id) do nothing;

-- Live synchronization between every connected browser.
do $$
declare table_name text;
begin
  foreach table_name in array array['orders','staff','profiles','events','announcements','documents','time_entries','cash_entries','applications','menu','restaurants','promotions','settings']
  loop
    if not exists (
      select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = table_name
    ) then
      execute format('alter publication supabase_realtime add table public.%I', table_name);
    end if;
  end loop;
end $$;

-- Seed the public content after creating the tables.
insert into menu (id, category, name, description, price, "imageUrl", badge, stock, available, featured) values
('menu-classic','Menus','Menu Atom Classic','Atom Classic, frites classiques et boisson au choix.',13.90,'','Populaire',60,true,true),
('menu-double','Menus','Menu Double Atom','Double Atom, frites cheddar et boisson au choix.',17.90,'','Edition limitee',35,true,true),
('menu-family','Menus','Menu Family Atom','Deux burgers, deux accompagnements et deux boissons.',29.90,'','Nouveau',22,true,false),
('classic','Burgers','Atom Classic','Steak grille, cheddar, salade, tomate et sauce Atom.',8.90,'','Populaire',80,true,true),
('double','Burgers','Double Atom','Deux steaks, double cheddar, oignons, cornichons et sauce maison.',12.90,'','Populaire',45,true,true),
('spicy','Burgers','Spicy San Andreas','Steak grille, cheddar, jalapenos et sauce rouge relevee.',10.90,'','Edition limitee',18,true,false),
('fries','Accompagnements','Frites Atom','Frites dorees et salees.',3.50,'','',120,true,false),
('ecola','Boissons','eCola','Le classique bien frais.',2.50,'','',90,true,false),
('shake','Desserts','Jumbo Shake','Vanille, chocolat ou fraise.',4.90,'','Populaire',35,true,false)
on conflict (id) do nothing;

insert into restaurants (id,name,hours,phone,x,y) values
('roxwood','Up-n-Atom Roxwood','12:00 - 23:00','555-ATOM-00',52,8)
on conflict (id) do nothing;

insert into promotions (id,title,offer,description) values
('p1','Duo Atom','19,90 $','Deux Atom Classic, deux frites et deux eCola.'),
('p2','Spicy Night','-20 %','Reduction sur le Spicy San Andreas apres 22 h.'),
('p3','Shake Friday','1 achete = 1 offert','Tous les vendredis sur les Jumbo Shakes.')
on conflict (id) do nothing;
