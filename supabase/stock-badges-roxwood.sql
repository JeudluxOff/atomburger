-- Run once in Supabase SQL Editor.
-- Adds product badges/stocks and keeps only the Roxwood restaurant.

alter table public.menu add column if not exists badge text default '';
alter table public.menu add column if not exists stock integer not null default 50;

update public.menu
set badge = case
  when id in ('menu-family', 'veggie', 'energy') then 'Nouveau'
  when id in ('menu-classic', 'classic', 'double', 'shake') then 'Populaire'
  when id in ('menu-double', 'spicy') then 'Edition limitee'
  else coalesce(badge, '')
end
where coalesce(badge, '') = '';

update public.menu
set stock = case
  when id = 'donut' then 0
  when category = 'Boissons' then 90
  when category = 'Accompagnements' then 60
  when category = 'Menus' then 35
  else 45
end
where stock is null or stock = 50;

update public.menu
set available = false
where stock = 0;

delete from public.restaurants
where id <> 'roxwood';

insert into public.restaurants (id, name, hours, phone, x, y, active)
values ('roxwood', 'Up-n-Atom Roxwood', '12:00 - 23:00', '555-ATOM-00', 52, 8, true)
on conflict (id) do update set
  name = excluded.name,
  hours = excluded.hours,
  phone = excluded.phone,
  x = excluded.x,
  y = excluded.y,
  active = excluded.active;

update public.staff
set restaurant = 'Up-n-Atom Roxwood'
where restaurant is null
   or restaurant = ''
   or restaurant in ('Vinewood Boulevard', 'Vespucci Beach', 'Legion Square', 'Sandy Shores', 'Roxwood Nord');

alter table public.menu replica identity full;
alter table public.restaurants replica identity full;

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

do $$
begin
  begin alter publication supabase_realtime add table public.menu; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.restaurants; exception when duplicate_object then null; end;
end $$;
