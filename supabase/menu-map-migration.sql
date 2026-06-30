-- Run this once in Supabase SQL Editor to add menu images, combo menus, and Roxwood.
alter table menu add column if not exists "imageUrl" text default '';

insert into menu (id, category, name, description, price, "imageUrl", available, featured) values
('menu-classic','Menus','Menu Atom Classic','Atom Classic, frites classiques et boisson au choix.',13.90,'',true,true),
('menu-double','Menus','Menu Double Atom','Double Atom, frites cheddar et boisson au choix.',17.90,'',true,true),
('menu-family','Menus','Menu Family Atom','Deux burgers, deux accompagnements et deux boissons.',29.90,'',true,false)
on conflict (id) do update set
  category = excluded.category,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  "imageUrl" = coalesce(menu."imageUrl", excluded."imageUrl"),
  available = excluded.available,
  featured = excluded.featured;

insert into restaurants (id, name, hours, phone, x, y, active) values
('roxwood','Roxwood Nord','12:00 - 23:00','555-ATOM-00',52,8,true)
on conflict (id) do update set
  name = excluded.name,
  hours = excluded.hours,
  phone = excluded.phone,
  x = excluded.x,
  y = excluded.y,
  active = excluded.active;
