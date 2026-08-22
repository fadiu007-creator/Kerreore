# Kerreore — P2P Hourly Car Rental

## 1. Product vision
Kerreore is a peer-to-peer marketplace where people can rent cars from local owners by the hour. The product should feel fast, trustworthy, modern, mobile-first, and easy enough to book a car in a few taps.

## 2. Core users
- Renters: discover, compare, reserve, and manage hourly car rentals.
- Owners: publish vehicles, define hourly pricing/availability, approve or manage bookings, and track earnings.
- Admins: moderate users, vehicles, bookings, reports, and marketplace activity.

## 3. MVP user journeys
### Renter
1. Land on homepage.
2. Choose location, date, start time, and duration.
3. Browse available cars.
4. Filter by price, vehicle type, transmission, fuel/EV, seats, and features.
5. Open a vehicle detail page.
6. Select hourly slot and review total price.
7. Sign in/create account if needed.
8. Confirm booking.
9. View booking status and details.

### Owner
1. Create account.
2. Add vehicle with photos, make/model/year, location, features, rules, and hourly price.
3. Configure availability.
4. Receive/manage booking requests.
5. View upcoming bookings and earnings.

## 4. Frontend
- Next.js App Router + TypeScript.
- Tailwind CSS and reusable accessible UI components.
- Responsive mobile-first design.
- Premium marketplace visual language: large vehicle imagery, clear pricing, strong search, cards, map-ready layout, subtle motion.
- Dark/light theme support where practical.
- Albanian and English localization architecture; Kosovo-first content and currency presentation.

## 5. Main routes
- `/` — discovery homepage
- `/cars` — search/results
- `/cars/[id]` — vehicle detail and booking
- `/bookings` — renter bookings
- `/bookings/[id]` — booking details
- `/dashboard` — user dashboard
- `/dashboard/cars` — owner vehicles
- `/dashboard/cars/new` — add vehicle
- `/dashboard/bookings` — owner booking management
- `/dashboard/earnings` — owner earnings
- `/login`, `/signup`
- `/profile`
- `/admin` — future admin area

## 6. Domain model
Planned entities:
- User
- Vehicle
- VehicleImage
- AvailabilityRule
- AvailabilityException
- Booking
- Payment
- Review
- Location
- Favorite
- Notification

## 7. Booking rules
- Hourly pricing is the primary rental unit.
- Availability must prevent overlapping confirmed bookings.
- Booking totals are calculated server-side.
- Time zone is explicit; initial market uses Kosovo local time.
- Cancellation/refund rules will be configurable rather than hard-coded into UI.
- Payment integration will be added after the booking domain is stable.

## 8. Trust and safety
- Vehicle and owner profiles should expose useful verification/trust signals.
- Never expose private user information unnecessarily.
- Server-side authorization for owner/admin operations.
- Validate all booking, pricing, and availability inputs server-side.
- Add reporting/moderation workflows before production launch.

## 9. Data/backend strategy
Initial implementation should keep a clean repository/service boundary so a managed PostgreSQL backend can be introduced without rewriting the UI. Supabase/Postgres is the preferred production direction unless project constraints change.

## 10. Payments
Future payment layer should support:
- authorization/charge for booking
- marketplace owner payouts
- platform fee
- refunds/cancellations
- payment status reconciliation
Stripe is the planned candidate.

## 11. Search and location
MVP can begin with structured locations and deterministic availability filtering. Later iterations can add map search, geocoding, distance sorting, and location-aware discovery.

## 12. Quality gates
Every major milestone should include:
- TypeScript/build validation
- responsive UI review
- accessibility checks
- booking/availability edge-case checks
- security/authorization review
- deployment verification

## 13. Delivery phases
### Phase 0 — Foundation
Repository, architecture, plan/worklog, application shell, design system, mock data.

### Phase 1 — Marketplace UI
Homepage, search, filters, car cards, detail page, responsive navigation, booking widget.

### Phase 2 — Owner experience
Owner dashboard, vehicle creation/editing, availability management, booking management.

### Phase 3 — Accounts + backend
Authentication, database schema, server-side booking logic, persistence.

### Phase 4 — Payments + trust
Payments, payouts, verification signals, reviews, cancellation/refund logic.

### Phase 5 — Production
Testing, observability, security hardening, SEO, localization, Vercel deployment, production verification.

## 14. Product principles
1. Booking should be understandable before sign-in.
2. Price and availability must always be obvious.
3. Mobile UX is a first-class experience.
4. Owners should be able to list a car without technical knowledge.
5. Never trust client-side pricing or availability decisions.
6. Build real domain logic behind the polished frontend; avoid a throwaway prototype.
