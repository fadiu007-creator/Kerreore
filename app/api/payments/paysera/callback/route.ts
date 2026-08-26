import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * Paysera macro API callback (server-to-server).
 * Docs: https://developers.paysera.com/en/checkout/integrations/integration-macro
 *
 * Paysera POSTs `data` (base64url-encoded query string) and `ss1`
 * (md5(data + projectPassword)) after a payment attempt. We must verify the
 * signature, confirm the amount/currency match the booking, then mark the
 * booking paid. Paysera requires the literal response body "OK" — anything
 * else is treated as a failure and retried.
 */
export async function POST(request: Request) {
  const password = process.env.PAYSERA_PROJECT_PASSWORD;
  if (!password) {
    return new NextResponse("FAIL", { status: 503 });
  }

  const form = await request.formData();
  const data = String(form.get("data") ?? "");
  const ss1 = String(form.get("ss1") ?? "");
  if (!data || !ss1) {
    return new NextResponse("FAIL", { status: 400 });
  }

  const expectedSign = crypto.createHash("md5").update(data + password).digest("hex");
  // Constant-time comparison to avoid timing side-channels on the signature check.
  const signatureValid =
    expectedSign.length === ss1.length &&
    crypto.timingSafeEqual(Buffer.from(expectedSign), Buffer.from(ss1));
  if (!signatureValid) {
    return new NextResponse("FAIL", { status: 400 });
  }

  const decoded = Buffer.from(
    data.replace(/-/g, "+").replace(/_/g, "/"),
    "base64",
  ).toString("utf8");
  const params = new URLSearchParams(decoded);
  const orderId = params.get("orderid");
  const status = params.get("status");
  const payAmount = Number(params.get("payamount") ?? "");
  const payCurrency = params.get("paycurrency");
  if (!orderId) {
    return new NextResponse("FAIL", { status: 400 });
  }

  const supabase = createServiceClient();
  const { data: booking, error } = await supabase
    .from("kerreore_bookings")
    .select("id,total_amount,payment_status,payment_reference,status")
    .eq("id", orderId)
    .single();

  if (error || !booking || booking.payment_reference !== orderId) {
    return new NextResponse("FAIL", { status: 404 });
  }

  // Paysera status=1 means the payment was accepted. Re-derive the expected
  // amount from the booking record (never trust the callback's amount alone)
  // and only mark paid when currency/amount match exactly.
  const expectedAmountCents = Math.round(Number(booking.total_amount) * 100);
  const paymentAccepted =
    status === "1" && payCurrency === "EUR" && payAmount === expectedAmountCents;

  if (paymentAccepted && booking.payment_status !== "paid") {
    const { error: updateError } = await supabase
      .from("kerreore_bookings")
      .update({ payment_status: "paid" })
      .eq("id", orderId);
    if (updateError) {
      return new NextResponse("FAIL", { status: 500 });
    }
  }

  // Always acknowledge with "OK" once we've validly processed the callback
  // (including a legitimately declined/mismatched payment), so Paysera does
  // not keep retrying a callback we've already handled.
  return new NextResponse("OK", { status: 200 });
}

// Paysera also allows GET for the accepturl bounce-back in some flows; keep
// this endpoint POST-only for the actual server-to-server callback.
export async function GET() {
  return new NextResponse("Method not allowed", { status: 405 });
}
