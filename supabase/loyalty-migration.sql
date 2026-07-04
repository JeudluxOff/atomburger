-- Run once in Supabase SQL Editor.
-- Adds the Atom Club loyalty card entries used for manual cash payment stamps.

create table if not exists loyalty_entries (
  id text primary key,
  "customerId" uuid references auth.users(id) on delete cascade,
  "customerName" text not null default '',
  "employeeId" text not null default '',
  "employeeName" text not null default '',
  "cashEntryId" text,
  points integer not null default 1 check (points > 0),
  amount numeric(10,2) default 0,
  reason text default 'Paiement caisse',
  "createdAt" timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table loyalty_entries enable row level security;

drop policy if exists "customers read own loyalty entries" on loyalty_entries;
drop policy if exists "employees read loyalty entries" on loyalty_entries;
drop policy if exists "employees add loyalty entries" on loyalty_entries;
drop policy if exists "managers manage loyalty entries" on loyalty_entries;

create policy "customers read own loyalty entries"
on loyalty_entries for select
using (auth.uid() = "customerId");

create policy "employees read loyalty entries"
on loyalty_entries for select
using (is_employee());

create policy "employees add loyalty entries"
on loyalty_entries for insert
with check (is_employee());

create policy "managers manage loyalty entries"
on loyalty_entries for all
using (is_manager())
with check (is_manager());

do $$
begin
  alter publication supabase_realtime add table public.loyalty_entries;
exception
  when duplicate_object then null;
end $$;
