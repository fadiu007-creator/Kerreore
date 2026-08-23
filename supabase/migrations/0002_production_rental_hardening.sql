-- Kerreore production rental hardening: roles, moderation, storage, availability and booking security.
create extension if not exists btree_gist;

-- Provider role is granted by the database when a vehicle is listed; non-admins cannot self-promote.
create or replace function public.kerreore_sync_provider_role() returns trigger language plpgsql security definer set search_path=public as $$ begin if exists (select 1 from public.kerreore_profiles where id=new.owner_id and role <> 'admin') then update public.kerreore_profiles set role='provider' where id=new.owner_id; end if; if not public.kerreore_is_admin() then new.published := false; end if; return new; end; $$;
drop trigger if exists kerreore_vehicle_provider_role on public.kerreore_vehicles;
create trigger kerreore_vehicle_provider_role before insert or update on public.kerreore_vehicles for each row execute function public.kerreore_sync_provider_role();

-- Prevent profile role escalation.
create or replace function public.kerreore_protect_profile_role() returns trigger language plpgsql security definer set search_path=public as $$ begin if not public.kerreore_is_admin() then new.role := old.role; end if; return new; end; $$;
drop trigger if exists kerreore_profile_role_guard on public.kerreore_profiles;
create trigger kerreore_profile_role_guard before update on public.kerreore_profiles for each row execute function public.kerreore_protect_profile_role();

-- Public vehicle images with owner-scoped writes.
insert into storage.buckets (id,name,public) values ('kerreore-vehicles','kerreore-vehicles',true) on conflict (id) do update set public=true;
drop policy if exists kerreore_vehicle_images_storage_read on storage.objects;
drop policy if exists kerreore_vehicle_images_storage_insert on storage.objects;
drop policy if exists kerreore_vehicle_images_storage_update on storage.objects;
drop policy if exists kerreore_vehicle_images_storage_delete on storage.objects;
create policy kerreore_vehicle_images_storage_read on storage.objects for select using (bucket_id='kerreore-vehicles');
create policy kerreore_vehicle_images_storage_insert on storage.objects for insert to authenticated with check (bucket_id='kerreore-vehicles' and (storage.foldername(name))[1]=auth.uid()::text);
create policy kerreore_vehicle_images_storage_update on storage.objects for update to authenticated using (bucket_id='kerreore-vehicles' and (storage.foldername(name))[1]=auth.uid()::text) with check (bucket_id='kerreore-vehicles' and (storage.foldername(name))[1]=auth.uid()::text);
create policy kerreore_vehicle_images_storage_delete on storage.objects for delete to authenticated using (bucket_id='kerreore-vehicles' and (storage.foldername(name))[1]=auth.uid()::text);

-- Database-level overlap protection.
alter table public.kerreore_bookings drop constraint if exists kerreore_bookings_no_overlap;
alter table public.kerreore_bookings add constraint kerreore_bookings_no_overlap exclude using gist (vehicle_id with =, tstzrange(starts_at,ends_at,'[)') with &&) where (status in ('pending','confirmed'));

-- Only the secure RPC can create a booking; clients cannot spoof price/owner/status with a direct insert.
drop policy if exists kerreore_bookings_renter_insert on public.kerreore_bookings;
create or replace function public.kerreore_create_booking(p_vehicle_id uuid,p_starts_at timestamptz,p_ends_at timestamptz) returns public.kerreore_bookings language plpgsql security definer set search_path=public as $$ declare v public.kerreore_vehicles; r public.kerreore_bookings; hours numeric; dow int; start_t time; end_t time; begin if auth.uid() is null then raise exception 'Authentication required'; end if; if p_ends_at<=p_starts_at or p_starts_at<now() then raise exception 'Invalid booking time'; end if; if (p_starts_at at time zone 'Europe/Pristina')::date<>(p_ends_at at time zone 'Europe/Pristina')::date then raise exception 'Bookings must start and end on the same day'; end if; select * into v from public.kerreore_vehicles where id=p_vehicle_id and published=true; if not found then raise exception 'Vehicle is not available'; end if; if v.owner_id=auth.uid() then raise exception 'You cannot book your own vehicle'; end if; hours:=extract(epoch from (p_ends_at-p_starts_at))/3600; if hours<=0 or hours>24 then raise exception 'Bookings must be between 1 and 24 hours'; end if; dow:=extract(dow from p_starts_at at time zone 'Europe/Pristina'); start_t:=(p_starts_at at time zone 'Europe/Pristina')::time; end_t:=(p_ends_at at time zone 'Europe/Pristina')::time; if not exists(select 1 from public.kerreore_availability_rules a where a.vehicle_id=p_vehicle_id and a.weekday=dow and a.start_time<=start_t and a.end_time>=end_t) then raise exception 'Vehicle is outside provider availability'; end if; insert into public.kerreore_bookings(vehicle_id,renter_id,starts_at,ends_at,hourly_rate,total_amount,status,payment_status) values(p_vehicle_id,auth.uid(),p_starts_at,p_ends_at,v.hourly_rate,round(v.hourly_rate*hours,2),'pending','unpaid') returning * into r; return r; exception when exclusion_violation then raise exception 'Vehicle is already booked for that time'; end; $$;
revoke all on function public.kerreore_create_booking(uuid,timestamptz,timestamptz) from public;
grant execute on function public.kerreore_create_booking(uuid,timestamptz,timestamptz) to authenticated;

-- Controlled booking state transitions.
create or replace function public.kerreore_update_booking_status(p_booking_id uuid,p_status text) returns public.kerreore_bookings language plpgsql security definer set search_path=public as $$ declare b public.kerreore_bookings; owner_ok boolean; begin if auth.uid() is null then raise exception 'Authentication required'; end if; select * into b from public.kerreore_bookings where id=p_booking_id for update; if not found then raise exception 'Booking not found'; end if; if public.kerreore_is_admin() then update public.kerreore_bookings set status=p_status where id=p_booking_id returning * into b; return b; end if; select exists(select 1 from public.kerreore_vehicles v where v.id=b.vehicle_id and v.owner_id=auth.uid()) into owner_ok; if owner_ok and b.status='pending' and p_status in ('confirmed','cancelled') then update public.kerreore_bookings set status=p_status where id=p_booking_id returning * into b; return b; end if; if b.renter_id=auth.uid() and b.status in ('pending','confirmed') and p_status='cancelled' then update public.kerreore_bookings set status='cancelled' where id=p_booking_id returning * into b; return b; end if; raise exception 'Not authorized'; end; $$;
revoke all on function public.kerreore_update_booking_status(uuid,text) from public;
grant execute on function public.kerreore_update_booking_status(uuid,text) to authenticated;
