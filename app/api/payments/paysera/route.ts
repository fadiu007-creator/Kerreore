import { createClient } from "@/lib/supabase/server";
import crypto from "node:crypto";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { bookingId } = await request.json();
  if (!bookingId) return NextResponse.json({ error: "bookingId is required" }, { status: 400 });

  const { data: booking, error } = await supabase.from("kerreore_bookings")
    .select("id,renter_id,total_amount,status,payment_status")
    .eq("id", bookingId).eq("renter_id", user.id).single();
  if (error || !booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  if (!["pending","confirmed"].includes(booking.status)) return NextResponse.json({ error: "Booking is not payable" }, { status: 400 });
  if (booking.payment_status === "paid") return NextResponse.json({ error: "Booking is already paid" }, { status: 400 });

  const projectId = process.env.PAYSERA_PROJECT_ID;
  const password = process.env.PAYSERA_PROJECT_PASSWORD;
  if (!projectId || !password) return NextResponse.json({ error: "Paysera is not configured yet" }, { status: 503 });

  const origin = new URL(request.url).origin;
  const amount = Math.round(Number(booking.total_amount) * 100);
  if (!Number.isFinite(amount) || amount <= 0) return NextResponse.json({ error: "Invalid booking amount" }, { status: 400 });

  const params: Record<string,string> = {
    projectid: projectId, orderid: booking.id, amount: String(amount), currency: "EUR",
    accepturl: origin + "/bookings?payment=success",
    cancelurl: origin + "/bookings?payment=cancelled",
    callbackurl: origin + "/api/payments/paysera/callback", version: "1.8", lang: "en"
  };
  if (process.env.PAYSERA_TEST_MODE === "true") params.test = "1";
  const encoded = Buffer.from(new URLSearchParams(params).toString()).toString("base64").replace(/\//g, "_").replace(/\+/g, "-");
  const sign = crypto.createHash("md5").update(encoded + password).digest("hex");
  const paymentUrl = "https://www.paysera.com/pay/?" + new URLSearchParams({data: encoded, sign}).toString();
  await supabase.from("kerreore_bookings").update({payment_provider:"paysera", payment_reference:booking.id}).eq("id", booking.id);
  return NextResponse.json({ paymentUrl });
}
