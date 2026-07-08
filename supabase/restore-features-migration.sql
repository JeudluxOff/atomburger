-- Correctif cumulatif : livraison, suppression client et fidelite.
-- A executer une seule fois dans l'editeur SQL Supabase.

alter table profiles add column if not exists "loyaltyPoints" integer not null default 0;

alter table orders add column if not exists "deliveryZone" text default '';
alter table orders add column if not exists "deliveryFee" numeric(10,2) not null default 0;
alter table orders add column if not exists "loyaltyAwarded" boolean not null default false;

alter table cash_entries add column if not exists "customerId" uuid;
alter table cash_entries add column if not exists "customerName" text default '';
alter table cash_entries add column if not exists "loyaltyPoints" integer not null default 0;

do $$
begin
  if exists (select 1 from pg_constraint where conname = 'orders_customerId_fkey') then
    alter table orders drop constraint "orders_customerId_fkey";
  end if;
  alter table orders add constraint "orders_customerId_fkey"
    foreign key ("customerId") references auth.users(id) on delete set null;
exception when duplicate_object then null;
end $$;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'cash_entries_customerId_fkey') then
    alter table cash_entries add constraint "cash_entries_customerId_fkey"
      foreign key ("customerId") references auth.users(id) on delete set null;
  end if;
end $$;
