insert into public.restaurants (id, name, hours, phone, x, y, active)
values ('roxwood', 'Roxwood Nord', '12:00 - 23:00', '555-ATOM-00', 23, 19, true)
on conflict (id) do update set
  name = excluded.name,
  hours = excluded.hours,
  phone = excluded.phone,
  x = excluded.x,
  y = excluded.y,
  active = true;
