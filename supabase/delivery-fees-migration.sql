-- Frais de livraison par zone pour les commandes Up-n-Atom.
alter table public.orders add column if not exists "deliveryZone" text default '';
alter table public.orders add column if not exists "deliveryFee" numeric(10,2) not null default 0;
