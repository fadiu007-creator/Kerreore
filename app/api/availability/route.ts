import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const startsAt = body?.startsAt ? new Date(body.startsAt) : null;
  const endsAt = body?.endsAt ? new Date(body.endsAt) : null;
  if (!body?.vehicleId || !startsAt || !endsAt || Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime()) || endsAt <= startsAt) {
    return NextResponse.json({ available: false, error: "Invalid vehicle or time range." }, { status: 400 });
  }
  // Database-backed overlap checks are enabled when Supabase is configured.
  // This endpoint intentionally fails closed until a persistence adapter is connected.
  return NextResponse.json({ available: false, requiresPersistence: true, message: "Availability must be checked against the production booking database." }, { status: 503 });
}
