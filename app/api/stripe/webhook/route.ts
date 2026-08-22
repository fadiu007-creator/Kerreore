import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const signature = (await headers()).get("stripe-signature");
  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) return NextResponse.json({ error: "Missing webhook signature" }, { status: 400 });
  try {
    const body = await request.text();
    const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    switch (event.type) {
      case "checkout.session.completed":
        console.info("booking_payment_completed", event.data.object.id);
        break;
      case "checkout.session.expired":
        console.info("booking_payment_expired", event.data.object.id);
        break;
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("stripe_webhook_error", error);
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }
}
