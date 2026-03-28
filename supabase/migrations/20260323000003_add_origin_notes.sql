alter table public.itineraries
  add column if not exists origin text,
  add column if not exists notes text;
