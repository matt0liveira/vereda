alter table public.itineraries
  add column if not exists transport text,
  add column if not exists accommodation text,
  add column if not exists people_count integer;
