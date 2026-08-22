create extension if not exists "pgcrypto";

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  avatar_url text,
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists vehicles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  make text not null,
  model text not null,
  year int not null check (year between 1980 and 2100),
  hourly_rate numeric(10,2) not null check (hourly_rate > 0),
  city text not null,
  address text,
  seats int not null default 5,
  transmission text not null default 'automatic',
  fuel text not null default 'petrol',
  description text,
  status text not null default 'active' check (status in ('draft','active','paused','pending_review')),
  created_at timestamptz not null default now()
);

create table if not exists vehicle_images (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references vehicles(id) on delete cascade,
  url text not null,
  sort_order int not null default 0
);

create table if not exists availability_rules (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references vehicles(id) on delete cascade,
  weekday int not null check (weekday between 0 and 6),
  start_minute int not null check (start_minute between 0 and 1439),
  end_minute int not null check (end_minute between 1 and 1440),
  enabled boolean not null default true,
  unique(vehicle_id, weekday)
);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references vehicles(id),
  renter_id uuid not null references profiles(id),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  hourly_rate numeric(10,2) not null,
  subtotal numeric(10,2) not null,
  platform_fee numeric(10,2) not null default 0,
  total numeric(10,2) not null,
  status text not null default 'pending' check (status in ('pending','confirmed','cancelled','completed')),
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create index if not exists vehicles_city_idx on vehicles(city);
create index if not exists vehicles_owner_idx on vehicles(owner_id);
create index if not exists bookings_vehicle_time_idx on bookings(vehicle_id, starts_at, ends_at);
create index if not exists bookings_renter_idx on bookings(renter_id, starts_at desc);

alter table profiles enable row level security;
alter table vehicles enable row level security;
alter table vehicle_images enable row level security;
alter table availability_rules enable row level security;
alter table bookings enable row level security;

create policy "public active vehicles" on vehicles for select using (status = 'active');
create policy "owners manage vehicles" on vehicles for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "public vehicle images" on vehicle_images for select using (exists (select 1 from vehicles v where v.id = vehicle_id and v.status = 'active'));
create policy "owners manage vehicle images" on vehicle_images for all using (exists (select 1 from vehicles v where v.id = vehicle_id and v.owner_id = auth.uid()));
create policy "owners manage availability" on availability_rules for all using (exists (select 1 from vehicles v where v.id = vehicle_id and v.owner_id = auth.uid())) with check (exists (select 1 from vehicles v where v.id = vehicle_id and v.owner_id = auth.uid()));
create policy "users see own bookings" on bookings for select using (renter_id = auth.uid() or exists (select 1 from vehicles v where v.id = vehicle_id and v.owner_id = auth.uid()));
create policy "renters create bookings" on bookings for insert with check (renter_id = auth.uid());
