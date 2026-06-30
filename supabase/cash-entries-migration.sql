-- Run this once in Supabase SQL Editor to add employee cash/accounting entries.
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

alter table cash_entries enable row level security;

drop policy if exists "employees read cash entries" on cash_entries;
drop policy if exists "employees add cash entries" on cash_entries;
drop policy if exists "managers manage cash entries" on cash_entries;

create policy "employees read cash entries" on cash_entries for select using (is_employee());
create policy "employees add cash entries" on cash_entries for insert with check (is_employee());
create policy "managers manage cash entries" on cash_entries for all using (is_manager()) with check (is_manager());

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'cash_entries'
  ) then
    alter publication supabase_realtime add table public.cash_entries;
  end if;
end $$;
