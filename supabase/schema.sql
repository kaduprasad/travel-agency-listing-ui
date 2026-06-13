-- =====================================================================
-- Skyline Travels — Initial schema, RLS policies, storage, and seed data
-- Paste this entire file into Supabase Dashboard -> SQL Editor -> Run.
-- Safe to re-run: uses IF NOT EXISTS / IF EXISTS guards.
-- =====================================================================

-- ---------- Extensions ----------
create extension if not exists "pgcrypto";

-- ---------- Enums ----------
do $$ begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type user_role as enum ('agency_admin', 'super_admin');
  end if;
  if not exists (select 1 from pg_type where typname = 'travel_type') then
    create type travel_type as enum ('local', 'intercity', 'airport', 'package');
  end if;
  if not exists (select 1 from pg_type where typname = 'enquiry_status') then
    create type enquiry_status as enum ('new', 'contacted', 'confirmed', 'closed', 'cancelled');
  end if;
end $$;

-- ---------- Helper: updated_at trigger ----------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------- Agencies ----------
create table if not exists public.agencies (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  name         text not null,
  tagline      text,
  description  text,
  phone        text,
  email        text,
  whatsapp     text,
  address      jsonb,
  hero_images  text[] default array[]::text[],
  logo_url     text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
drop trigger if exists agencies_set_updated_at on public.agencies;
create trigger agencies_set_updated_at before update on public.agencies
for each row execute function set_updated_at();

-- ---------- Profiles (1-to-1 with auth.users) ----------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  agency_id   uuid references public.agencies(id) on delete set null,
  role        user_role not null default 'agency_admin',
  full_name   text,
  phone       text,
  created_at  timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user is added
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  default_agency uuid;
begin
  select id into default_agency from public.agencies where slug = 'skyline-travels' limit 1;
  insert into public.profiles (id, agency_id, role, full_name)
  values (
    new.id,
    default_agency,
    coalesce((new.raw_user_meta_data ->> 'role')::user_role, 'agency_admin'),
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Cars ----------
create table if not exists public.cars (
  id                       uuid primary key default gen_random_uuid(),
  agency_id                uuid not null references public.agencies(id) on delete cascade,
  model                    text not null,
  category                 text not null,
  seats                    int not null default 4,
  luggage                  int,
  ac                       boolean not null default true,
  transmission             text check (transmission in ('manual','automatic')),
  fuel_type                text,
  local_rate_per_km        numeric(10,2),
  intercity_rate_per_km    numeric(10,2),
  airport_flat_rate        numeric(10,2),
  package_km               int,
  package_total            numeric(10,2),
  min_km_per_day           int,
  driver_charge_per_day    numeric(10,2),
  features                 text[] default array[]::text[],
  images                   text[] not null default array[]::text[],
  primary_image            text,
  is_active                boolean not null default true,
  sort_order               int not null default 0,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);
create index if not exists cars_agency_active_idx on public.cars(agency_id, is_active, sort_order);
drop trigger if exists cars_set_updated_at on public.cars;
create trigger cars_set_updated_at before update on public.cars
for each row execute function set_updated_at();

-- ---------- Enquiries ----------
create table if not exists public.enquiries (
  id                  uuid primary key default gen_random_uuid(),
  agency_id           uuid not null references public.agencies(id) on delete cascade,
  car_id              uuid references public.cars(id) on delete set null,
  car_model_snapshot  text,
  travel_type         travel_type not null,
  full_name           text not null,
  phone               text not null,
  email               text,
  source_city         text,
  destination_city    text,
  start_date          date,
  end_date            date,
  start_time          text,
  end_time            text,
  message             text,
  status              enquiry_status not null default 'new',
  notes               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index if not exists enquiries_agency_created_idx on public.enquiries(agency_id, created_at desc);
create index if not exists enquiries_status_idx on public.enquiries(agency_id, status);
drop trigger if exists enquiries_set_updated_at on public.enquiries;
create trigger enquiries_set_updated_at before update on public.enquiries
for each row execute function set_updated_at();

-- ---------- Push subscriptions (Web Push) ----------
create table if not exists public.push_subscriptions (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  agency_id   uuid not null references public.agencies(id) on delete cascade,
  endpoint    text not null unique,
  p256dh      text not null,
  auth        text not null,
  user_agent  text,
  created_at  timestamptz not null default now()
);
create index if not exists push_subs_agency_idx on public.push_subscriptions(agency_id);

-- ---------- Realtime: stream new enquiries to subscribed admins ----------
alter publication supabase_realtime add table public.enquiries;

-- =====================================================================
-- Row Level Security
-- =====================================================================
alter table public.agencies          enable row level security;
alter table public.profiles          enable row level security;
alter table public.cars              enable row level security;
alter table public.enquiries         enable row level security;
alter table public.push_subscriptions enable row level security;

-- Helper functions (security definer to avoid RLS recursion)
create or replace function public.current_profile()
returns public.profiles language sql security definer stable set search_path = public as $$
  select * from public.profiles where id = auth.uid();
$$;

create or replace function public.is_super_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'super_admin');
$$;

create or replace function public.current_agency_id()
returns uuid language sql security definer stable set search_path = public as $$
  select agency_id from public.profiles where id = auth.uid();
$$;

-- ---- agencies ----
drop policy if exists "agencies_public_read" on public.agencies;
create policy "agencies_public_read" on public.agencies for select using (true);

drop policy if exists "agencies_super_admin_write" on public.agencies;
create policy "agencies_super_admin_write" on public.agencies
  for all using (public.is_super_admin()) with check (public.is_super_admin());

drop policy if exists "agencies_admin_update_own" on public.agencies;
create policy "agencies_admin_update_own" on public.agencies
  for update using (id = public.current_agency_id())
  with check (id = public.current_agency_id());

-- ---- profiles ----
drop policy if exists "profiles_self_read" on public.profiles;
create policy "profiles_self_read" on public.profiles for select
  using (id = auth.uid() or public.is_super_admin());

drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update" on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "profiles_super_admin_all" on public.profiles;
create policy "profiles_super_admin_all" on public.profiles for all
  using (public.is_super_admin()) with check (public.is_super_admin());

-- ---- cars ----
drop policy if exists "cars_public_read_active" on public.cars;
create policy "cars_public_read_active" on public.cars for select using (is_active = true);

drop policy if exists "cars_admin_read_all" on public.cars;
create policy "cars_admin_read_all" on public.cars for select
  using (agency_id = public.current_agency_id() or public.is_super_admin());

drop policy if exists "cars_admin_write" on public.cars;
create policy "cars_admin_write" on public.cars for all
  using (agency_id = public.current_agency_id() or public.is_super_admin())
  with check (agency_id = public.current_agency_id() or public.is_super_admin());

-- ---- enquiries ----
-- Public can INSERT only (so a visitor can submit an enquiry without an account)
drop policy if exists "enquiries_public_insert" on public.enquiries;
create policy "enquiries_public_insert" on public.enquiries for insert with check (true);

drop policy if exists "enquiries_admin_select" on public.enquiries;
create policy "enquiries_admin_select" on public.enquiries for select
  using (agency_id = public.current_agency_id() or public.is_super_admin());

drop policy if exists "enquiries_admin_update" on public.enquiries;
create policy "enquiries_admin_update" on public.enquiries for update
  using (agency_id = public.current_agency_id() or public.is_super_admin())
  with check (agency_id = public.current_agency_id() or public.is_super_admin());

drop policy if exists "enquiries_admin_delete" on public.enquiries;
create policy "enquiries_admin_delete" on public.enquiries for delete
  using (agency_id = public.current_agency_id() or public.is_super_admin());

-- ---- push_subscriptions ----
drop policy if exists "push_subs_self_all" on public.push_subscriptions;
create policy "push_subs_self_all" on public.push_subscriptions for all
  using (profile_id = auth.uid() or public.is_super_admin())
  with check (profile_id = auth.uid() or public.is_super_admin());

-- =====================================================================
-- Storage: public bucket for car images
-- =====================================================================
insert into storage.buckets (id, name, public)
  values ('car-images', 'car-images', true)
  on conflict (id) do update set public = true;

drop policy if exists "car_images_public_read" on storage.objects;
create policy "car_images_public_read" on storage.objects for select
  using (bucket_id = 'car-images');

drop policy if exists "car_images_admin_write" on storage.objects;
create policy "car_images_admin_write" on storage.objects for all
  using (bucket_id = 'car-images' and auth.role() = 'authenticated')
  with check (bucket_id = 'car-images' and auth.role() = 'authenticated');

-- =====================================================================
-- Seed: Skyline Travels (default agency) + a few starter cars
-- Re-running is safe: cars only inserted if none exist for the agency.
-- =====================================================================
insert into public.agencies (slug, name, tagline, description, phone, email, whatsapp, address, hero_images)
values (
  'skyline-travels',
  'Skyline Travels',
  'Comfortable rides for every journey',
  'Skyline Travels offers reliable local, intercity, airport pickup and holiday car rental services in Pune with transparent per-km pricing and well-maintained vehicles.',
  '+91 98765 43210',
  'hello@skylinetravels.example',
  '+919876543210',
  jsonb_build_object(
    'line1', '12 MG Road',
    'line2', 'Near Central Mall',
    'city', 'Pune',
    'state', 'Maharashtra',
    'zip', '411001'
  ),
  array[
    'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=1600&q=80',
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&q=80',
    'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1600&q=80'
  ]
)
on conflict (slug) do update set
  tagline = excluded.tagline,
  phone = excluded.phone,
  email = excluded.email,
  whatsapp = excluded.whatsapp,
  address = excluded.address,
  hero_images = excluded.hero_images;

do $$
declare
  v_agency uuid;
begin
  select id into v_agency from public.agencies where slug = 'skyline-travels';
  if not exists (select 1 from public.cars where agency_id = v_agency) then
    insert into public.cars
      (agency_id, model, category, seats, luggage, ac, transmission, fuel_type,
       local_rate_per_km, intercity_rate_per_km, airport_flat_rate,
       package_km, package_total, min_km_per_day, driver_charge_per_day,
       features, images, primary_image, sort_order)
    values
      (v_agency, 'Maruti Suzuki Dzire', 'Sedan', 4, 2, true, 'manual', 'Petrol',
       12, 11, 1200, 300, 5000, 250, 300,
       array['Music System','Charging Port','First Aid'],
       array['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1200&q=80'],
       'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1200&q=80', 1),
      (v_agency, 'Toyota Innova Crysta', 'SUV', 7, 4, true, 'manual', 'Diesel',
       18, 17, 2200, 300, 7500, 250, 400,
       array['Recliner Seats','Music System','Extra Luggage Space','Bluetooth'],
       array['https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1200&q=80'],
       'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1200&q=80', 2),
      (v_agency, 'Hyundai Creta', 'SUV', 5, 3, true, 'automatic', 'Petrol',
       16, 15, 1800, 300, 6500, 250, 350,
       array['Sunroof','Music System','Bluetooth','Charging Port'],
       array['https://images.unsplash.com/photo-1606220588913-b3aacb4d2f37?w=1200&q=80'],
       'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f37?w=1200&q=80', 3),
      (v_agency, 'Force Urbania', 'Tempo Traveller', 13, 8, true, 'manual', 'Diesel',
       28, 26, null, 300, 12000, 250, 600,
       array['Push-back Seats','LED TV','Music System','Charging Ports'],
       array['https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=1200&q=80'],
       'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=1200&q=80', 4);
  end if;
end $$;
