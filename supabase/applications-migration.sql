-- Run this once in Supabase SQL Editor to add synchronized job applications.
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

alter table applications enable row level security;

drop policy if exists "public creates applications" on applications;
drop policy if exists "managers read applications" on applications;
drop policy if exists "managers update applications" on applications;
drop policy if exists "managers delete applications" on applications;

create policy "public creates applications" on applications for insert with check (true);
create policy "managers read applications" on applications for select using (is_manager());
create policy "managers update applications" on applications for update using (is_manager()) with check (is_manager());
create policy "managers delete applications" on applications for delete using (is_manager());

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'applications'
  ) then
    alter publication supabase_realtime add table public.applications;
  end if;
end $$;
