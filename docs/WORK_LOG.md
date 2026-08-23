# Kerreore work log

## 2026-08-23 — production rental MVP

- Replaced browser/demo vehicle listing with Supabase-backed provider listing creation.
- Added provider role promotion at the database layer when a user lists a vehicle.
- Added weekly availability rules to vehicle creation.
- Added Supabase Storage bucket `kerreore-vehicles` with owner-scoped upload/update/delete policies.
- Added vehicle image records linked to storage paths.
- Replaced mock car catalogue with real published Supabase vehicles.
- Replaced mock vehicle detail booking UI with real hourly booking requests.
- Added secure `kerreore_create_booking` RPC that calculates price server-side and validates availability, ownership, future time and published status.
- Added PostgreSQL exclusion constraint preventing overlapping pending/confirmed bookings.
- Added renter booking dashboard and cancellation flow.
- Added provider booking dashboard with confirm/decline actions.
- Added controlled `kerreore_update_booking_status` RPC for booking state transitions.
- Added provider vehicle management/edit/delete page.
- Added admin moderation protection and preserved admin-only publishing.
- Hardened profile roles so non-admin users cannot self-promote.
- Removed direct booking inserts so clients cannot spoof totals/status.
- Recorded the production hardening SQL in `supabase/migrations/0002_production_rental_hardening.sql`.
- Payments intentionally remain disabled pending the replacement payment provider decision.

## Deployment

GitHub `main` is connected to Vercel. These commits are intended to trigger the production deployment automatically.
