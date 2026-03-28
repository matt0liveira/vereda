alter table public.itineraries
  add column if not exists checkin_time text,
  add column if not exists checkout_time text;
