-- Run once in Supabase SQL Editor.
-- Restores employee/admin access for admin@atom.sa after profile/customer sync.

do $$
declare
  admin_id uuid;
begin
  select id into admin_id
  from auth.users
  where lower(email) = lower('admin@atom.sa')
  limit 1;

  if admin_id is null then
    raise exception 'Compte admin@atom.sa introuvable dans Authentication > Users.';
  end if;

  delete from public.staff
  where (
    auth_id = admin_id
    or lower(email) = lower('admin@atom.sa')
    or username = 'admin'
  )
  and id <> 'staff-' || admin_id::text;

  insert into public.profiles (
    id,
    email,
    "firstName",
    "lastName",
    phone,
    address,
    role_type,
    role,
    permissions
  )
  values (
    admin_id,
    'admin@atom.sa',
    'Admin',
    'Atom',
    '',
    '',
    'employee',
    'Directeur Restaurant',
    '["calendar", "orders", "admin"]'::jsonb
  )
  on conflict (id) do update set
    email = excluded.email,
    "firstName" = excluded."firstName",
    "lastName" = excluded."lastName",
    role_type = 'employee',
    role = 'Directeur Restaurant',
    permissions = '["calendar", "orders", "admin"]'::jsonb;

  insert into public.staff (
    id,
    auth_id,
    username,
    email,
    "firstName",
    "lastName",
    role,
    permissions,
    position,
    restaurant,
    phone,
    iban
  )
  values (
    'staff-' || admin_id::text,
    admin_id,
    'admin',
    'admin@atom.sa',
    'Admin',
    'Atom',
    'Directeur Restaurant',
    '["calendar", "orders", "admin"]'::jsonb,
    'Direction',
    'Up-n-Atom Roxwood',
    '',
    ''
  )
  on conflict (id) do update set
    auth_id = excluded.auth_id,
    username = excluded.username,
    email = excluded.email,
    "firstName" = excluded."firstName",
    "lastName" = excluded."lastName",
    role = excluded.role,
    permissions = excluded.permissions,
    position = excluded.position,
    restaurant = excluded.restaurant;
end $$;
