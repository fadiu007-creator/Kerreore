import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    const { vehicleId, vehicleName, hourlyRate, hours } = await request.json();
    if (!vehicleId || !vehicleName || !Number.isFinite(hourlyRate) || !Number.isInteger(hours) || hours < 1 || hours > 24) {
      return NextResponse.json({ error: "Invalid booking details" }, { status: 400 });
    }

    const total = Math.round(hourlyRate * hours * 100);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: total,
          product_data: { name: `${vehicleName} — ${hours} hour${hours === 1 ? "" : "s"}` },
        },
      }],
      metadata: { vehicleId, hours: String(hours) },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/bookings?success=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/cars/${vehicleId}?cancelled=1`,
    });
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("checkout_error", error);
    return NextResponse.json({ error: "Unable to create checkout session" }, { status: 500 });
  }
}
