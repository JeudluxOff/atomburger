-- Run this once in Supabase SQL Editor to add menu images, combo menus, and Roxwood.
alter table menu add column if not exists "imageUrl" text default '';
alter table menu add column if not exists badge text default '';
alter table menu add column if not exists stock integer not null default 50;

insert into menu (id, category, name, description, price, "imageUrl", badge, stock, available, featured) values
('menu-classic','Menus','Menu Atom Classic','Atom Classic, frites classiques et boisson au choix.',13.90,'','Populaire',60,true,true),
('menu-double','Menus','Menu Double Atom','Double Atom, frites cheddar et boisson au choix.',17.90,'','Edition limitee',35,true,true),
('menu-family','Menus','Menu Family Atom','Deux burgers, deux accompagnements et deux boissons.',29.90,'','Nouveau',22,true,false)
on conflict (id) do update set
  category = excluded.category,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  "imageUrl" = coalesce(menu."imageUrl", excluded."imageUrl"),
  badge = excluded.badge,
  stock = excluded.stock,
  available = excluded.available,
  featured = excluded.featured;

delete from restaurants
where id <> 'roxwood';

insert into restaurants (id, name, hours, phone, x, y, active) values
('roxwood','Up-n-Atom Roxwood','12:00 - 23:00','555-ATOM-00',52,8,true)
on conflict (id) do update set
  name = excluded.name,
  hours = excluded.hours,
  phone = excluded.phone,
  x = excluded.x,
  y = excluded.y,
  active = excluded.active;
