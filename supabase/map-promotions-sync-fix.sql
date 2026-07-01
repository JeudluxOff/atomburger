-- Run once in Supabase SQL Editor.
-- This repairs sync for map/restaurants, promotions, products, applications and cash entries.

create extension if not exists pgcrypto;

create or replace function public.is_employee()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role_type = 'employee'
  );
$$;

create or replace function public.is_manager()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role_type = 'employee'
      and (
        permissions ? 'admin'
        or role in ('Directeur Restaurant', 'Assistant Directeur', 'Chef d equipe', 'Chef d’équipe', 'Manager')
      )
  );
$$;

create table if not exists public.menu (
  id text primary key,
  category text not null,
  name text not null,
  description text,
  price numeric(10,2) not null default 0,
  "imageUrl" text default '',
  available boolean not null default true,
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.restaurants (
  id text primary key,
  name text not null,
  hours text default '',
  phone text default '',
  x numeric default 50,
  y numeric default 50,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.promotions (
  id text primary key,
  title text not null,
  offer text default '',
  description text default '',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.applications (
  id text primary key,
  "firstName" text default '',
  "lastName" text default '',
  phone text default '',
  email text default '',
  role text default '',
  restaurant text default '',
  motivation text default '',
  status text not null default 'Nouvelle',
  created_at timestamptz not null default now()
);

create table if not exists public.cash_entries (
  id text primary key,
  "employeeId" text,
  "employeeName" text,
  amount numeric(10,2) not null default 0,
  label text default '',
  note text default '',
  date date default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.settings (
  id text primary key default 'global',
  "acceptingOrders" boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.menu add column if not exists "imageUrl" text default '';
alter table public.menu add column if not exists available boolean not null default true;
alter table public.menu add column if not exists featured boolean not null default false;
alter table public.menu add column if not exists created_at timestamptz not null default now();

alter table public.restaurants add column if not exists hours text default '';
alter table public.restaurants add column if not exists phone text default '';
alter table public.restaurants add column if not exists x numeric default 50;
alter table public.restaurants add column if not exists y numeric default 50;
alter table public.restaurants add column if not exists active boolean not null default true;
alter table public.restaurants add column if not exists created_at timestamptz not null default now();

alter table public.promotions add column if not exists offer text default '';
alter table public.promotions add column if not exists description text default '';
alter table public.promotions add column if not exists active boolean not null default true;
alter table public.promotions add column if not exists created_at timestamptz not null default now();

alter table public.applications add column if not exists "firstName" text default '';
alter table public.applications add column if not exists "lastName" text default '';
alter table public.applications add column if not exists phone text default '';
alter table public.applications add column if not exists email text default '';
alter table public.applications add column if not exists role text default '';
alter table public.applications add column if not exists restaurant text default '';
alter table public.applications add column if not exists motivation text default '';
alter table public.applications add column if not exists status text not null default 'Nouvelle';
alter table public.applications add column if not exists created_at timestamptz not null default now();

alter table public.cash_entries add column if not exists "employeeId" text;
alter table public.cash_entries add column if not exists "employeeName" text;
alter table public.cash_entries add column if not exists amount numeric(10,2) not null default 0;
alter table public.cash_entries add column if not exists label text default '';
alter table public.cash_entries add column if not exists note text default '';
alter table public.cash_entries add column if not exists date date default current_date;
alter table public.cash_entries add column if not exists created_at timestamptz not null default now();

alter table public.settings add column if not exists "acceptingOrders" boolean not null default true;
alter table public.settings add column if not exists created_at timestamptz not null default now();
insert into public.settings (id, "acceptingOrders")
values ('global', true)
on conflict (id) do nothing;

alter table public.menu enable row level security;
alter table public.restaurants enable row level security;
alter table public.promotions enable row level security;
alter table public.applications enable row level security;
alter table public.cash_entries enable row level security;
alter table public.settings enable row level security;

drop policy if exists "public reads menu" on public.menu;
drop policy if exists "employee manages menu" on public.menu;
drop policy if exists "manager manages menu" on public.menu;
create policy "public reads menu" on public.menu for select using (true);
create policy "manager manages menu" on public.menu for all using (public.is_manager()) with check (public.is_manager());

drop policy if exists "public reads restaurants" on public.restaurants;
drop policy if exists "employee manages restaurants" on public.restaurants;
drop policy if exists "manager manages restaurants" on public.restaurants;
create policy "public reads restaurants" on public.restaurants for select using (true);
create policy "manager manages restaurants" on public.restaurants for all using (public.is_manager()) with check (public.is_manager());

drop policy if exists "public reads promotions" on public.promotions;
drop policy if exists "employee manages promotions" on public.promotions;
drop policy if exists "manager manages promotions" on public.promotions;
create policy "public reads promotions" on public.promotions for select using (true);
create policy "manager manages promotions" on public.promotions for all using (public.is_manager()) with check (public.is_manager());

drop policy if exists "public creates applications" on public.applications;
drop policy if exists "employee reads applications" on public.applications;
drop policy if exists "manager manages applications" on public.applications;
create policy "public creates applications" on public.applications for insert with check (true);
create policy "employee reads applications" on public.applications for select using (public.is_employee());
create policy "manager manages applications" on public.applications for update using (public.is_manager()) with check (public.is_manager());

drop policy if exists "employee reads cash entries" on public.cash_entries;
drop policy if exists "employee creates cash entries" on public.cash_entries;
drop policy if exists "manager manages cash entries" on public.cash_entries;
create policy "employee reads cash entries" on public.cash_entries for select using (public.is_employee());
create policy "employee creates cash entries" on public.cash_entries for insert with check (public.is_employee());
create policy "manager manages cash entries" on public.cash_entries for all using (public.is_manager()) with check (public.is_manager());

drop policy if exists "public reads settings" on public.settings;
drop policy if exists "manager manages settings" on public.settings;
create policy "public reads settings" on public.settings for select using (true);
create policy "manager manages settings" on public.settings for all using (public.is_manager()) with check (public.is_manager());

alter table public.menu replica identity full;
alter table public.restaurants replica identity full;
alter table public.promotions replica identity full;
alter table public.applications replica identity full;
alter table public.cash_entries replica identity full;
alter table public.settings replica identity full;

do $$
begin
  begin alter publication supabase_realtime add table public.menu; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.restaurants; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.promotions; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.applications; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.cash_entries; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.settings; exception when duplicate_object then null; end;
end $$;
