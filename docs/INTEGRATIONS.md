# Production integrations

## Supabase
1. Create a Supabase project.
2. Run `supabase/migrations/0001_initial.sql` in the SQL editor.
3. Enable Email authentication (and any desired OAuth providers).
4. Create a Storage bucket named `vehicle-images` and configure policies for authenticated owners.
5. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to the deployment environment.

## Stripe
Kerreore uses Stripe Checkout for hourly rental payments. The server creates Checkout Sessions; never trust client-provided totals in production. Before launch, load the vehicle price from the database and calculate the booking total server-side, then create the session.

Required variables:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_APP_URL`

Configure Stripe webhook endpoint:
`https://YOUR_DOMAIN/api/stripe/webhook`

Subscribe to `checkout.session.completed` and `checkout.session.expired`.

## Authentication
Supabase Auth is the intended authentication provider for the initial deployment. The UI should use the Supabase browser client and server-side session validation for protected owner/renter operations.

## Vercel
Connect the GitHub repository to Vercel. Set all production environment variables before deploying. Preview and production variables should be configured separately.

## Important production hardening
- Move booking creation behind authenticated server-side logic.
- Calculate price from the database, not request data.
- Add a database transaction/constraint strategy to prevent overlapping bookings.
- Add Stripe Connect for owner payouts after the core booking payment flow is stable.
- Configure Storage RLS for vehicle images.
- Add rate limiting and abuse protection to public booking endpoints.
