create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  role text not null default 'renter' check (role in ('renter','owner','admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  make text not null, model text not null, year int not null check (year between 1900 and 2100),
  hourly_rate numeric(10,2) not null check (hourly_rate >= 0),
  location text not null, description text, transmission text, fuel text, seats int,
  status text not null default 'active' check (status in ('draft','active','paused')),
  created_at timestamptz not null default now()
);

create table if not exists public.vehicle_images (
  id uuid primary key default gen_random_uuid(), vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  storage_path text not null, sort_order int not null default 0
);

create table if not exists public.availability_rules (
  id uuid primary key default gen_random_uuid(), vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  weekday int not null check (weekday between 0 and 6), start_time time not null, end_time time not null,
  unique(vehicle_id, weekday)
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(), vehicle_id uuid not null references public.vehicles(id),
  renter_id uuid not null references public.profiles(id),
  starts_at timestamptz not null, ends_at timestamptz not null, hourly_rate numeric(10,2) not null,
  total_amount numeric(10,2) not null, status text not null default 'pending' check (status in ('pending','confirmed','cancelled','completed')),
  stripe_checkout_session_id text unique, created_at timestamptz not null default now(),
  check (ends_at > starts_at), check (total_amount >= 0)
);

create index if not exists bookings_vehicle_time_idx on public.bookings(vehicle_id, starts_at, ends_at);
create index if not exists vehicles_owner_idx on public.vehicles(owner_id);

alter table public.profiles enable row level security;
alter table public.vehicles enable row level security;
alter table public.vehicle_images enable row level security;
alter table public.availability_rules enable row level security;
alter table public.bookings enable row level security;

create policy "public can view active vehicles" on public.vehicles for select using (status = 'active' or owner_id = auth.uid());
create policy "owners manage own vehicles" on public.vehicles for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "owners manage own images" on public.vehicle_images for all using (exists (select 1 from public.vehicles v where v.id = vehicle_id and v.owner_id = auth.uid()));
create policy "owners manage own availability" on public.availability_rules for all using (exists (select 1 from public.vehicles v where v.id = vehicle_id and v.owner_id = auth.uid()));
create policy "renters view own bookings" on public.bookings for select using (renter_id = auth.uid() or exists (select 1 from public.vehicles v where v.id = vehicle_id and v.owner_id = auth.uid()));
create policy "renters create own bookings" on public.bookings for insert with check (renter_id = auth.uid());
