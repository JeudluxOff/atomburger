-- Run once in Supabase SQL Editor.
-- This backfills customer accounts from Supabase Auth into public.profiles
-- so they appear in Administration > Clients and synchronize between users.

insert into public.profiles (
  id,
  email,
  "firstName",
  "lastName",
  phone,
  address,
  role_type,
  role,
  permissions,
  created_at
)
select
  users.id,
  coalesce(users.email, ''),
  coalesce(users.raw_user_meta_data->>'first_name', users.raw_user_meta_data->>'firstName', ''),
  coalesce(users.raw_user_meta_data->>'last_name', users.raw_user_meta_data->>'lastName', ''),
  coalesce(users.raw_user_meta_data->>'phone', ''),
  coalesce(users.raw_user_meta_data->>'address', ''),
  'customer',
  null,
  '[]'::jsonb,
  coalesce(users.created_at, now())
from auth.users
where coalesce(users.raw_user_meta_data->>'role_type', users.raw_user_meta_data->>'roleType', 'customer') = 'customer'
  and lower(coalesce(users.email, '')) <> 'admin@atom.sa'
  and not exists (
    select 1
    from public.staff staff
    where staff.auth_id = users.id
      or lower(staff.email) = lower(coalesce(users.email, ''))
  )
  and not exists (
    select 1
    from public.profiles existing_profile
    where existing_profile.id = users.id
      and existing_profile.role_type = 'employee'
  )
on conflict (id) do update set
  email = excluded.email,
  "firstName" = case when public.profiles."firstName" = '' then excluded."firstName" else public.profiles."firstName" end,
  "lastName" = case when public.profiles."lastName" = '' then excluded."lastName" else public.profiles."lastName" end,
  phone = case when coalesce(public.profiles.phone, '') = '' then excluded.phone else public.profiles.phone end,
  address = case when coalesce(public.profiles.address, '') = '' then excluded.address else public.profiles.address end,
  role_type = 'customer',
  role = null,
  permissions = '[]'::jsonb
where public.profiles.role_type is distinct from 'employee';

do $$
begin
  alter publication supabase_realtime add table public.profiles;
exception
  when duplicate_object then null;
end $$;
