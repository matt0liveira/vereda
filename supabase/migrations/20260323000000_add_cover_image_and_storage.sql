-- Add cover_image column to itineraries
alter table public.itineraries
  add column if not exists cover_image text;

-- Create itinerary-covers storage bucket (public)
insert into storage.buckets (id, name, public)
values ('itinerary-covers', 'itinerary-covers', true)
on conflict (id) do nothing;

-- Storage policy: authenticated users can upload to their own folder
create policy "Users can upload their own covers"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'itinerary-covers'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

-- Storage policy: authenticated users can update/delete their own covers
create policy "Users can update their own covers"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'itinerary-covers'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy "Users can delete their own covers"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'itinerary-covers'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

-- Storage policy: public read access
create policy "Public read access for covers"
  on storage.objects for select
  to public
  using (bucket_id = 'itinerary-covers');
