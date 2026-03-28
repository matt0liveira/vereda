-- Create itineraries table
create table public.itineraries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  destination text not null,
  start_date date not null,
  end_date date not null,
  budget text not null,
  interests text[] not null,
  content jsonb not null default '{}',
  status text not null default 'draft',
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.itineraries enable row level security;

-- Policies: each user can only see and manage their own itineraries
create policy "Users can select their own itineraries"
  on public.itineraries for select
  to authenticated
  using ( (select auth.uid()) = user_id );

create policy "Users can insert their own itineraries"
  on public.itineraries for insert
  to authenticated
  with check ( (select auth.uid()) = user_id );

create policy "Users can update their own itineraries"
  on public.itineraries for update
  to authenticated
  using ( (select auth.uid()) = user_id )
  with check ( (select auth.uid()) = user_id );

create policy "Users can delete their own itineraries"
  on public.itineraries for delete
  to authenticated
  using ( (select auth.uid()) = user_id );
