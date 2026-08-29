"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Banknote, CreditCard, Landmark, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";
import { useLang } from "@/lib/i18n/lang-client";
import { t } from "@/lib/i18n/dictionary";
import { translateError } from "@/lib/i18n/errors";
import LanguageSwitcher from "@/components/LanguageSwitcher";
const KOSOVO_TZ = "Europe/Belgrade";

export default function MyBookings() {
  const lang = useLang();
  const supabase = createClient();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [payingId, setPayingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [bankInfo, setBankInfo] = useState<Record<string, { iban: string; holder: string } | null>>({});

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { location.href = "/login"; return; }
    const { data } = await supabase
      .from("kerreore_bookings")
      .select("id,starts_at,ends_at,total_amount,status,payment_status,payment_provider,kerreore_vehicles(make,model,location)")
      .eq("renter_id", user.id)
      .order("starts_at", { ascending: false });
    setRows(data ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function cancel(id: string) {
    const { error } = await supabase.rpc("kerreore_update_booking_status", { p_booking_id: id, p_status: "cancelled" });
    if (error) setMsg(translateError(error.message, lang));
    load();
  }

  async function payCard(id: string) {
    setBusyId(id); setMsg(t(lang, "bookings_redirecting"));
    try {
      const res = await fetch("/api/payments/paysera", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bookingId: id }) });
      const data = await res.json();
      if (!res.ok || !data.paymentUrl) { setMsg(translateError(data.error, lang)); setBusyId(null); return; }
      window.location.href = data.paymentUrl;
    } catch {
      setMsg(translateError("network", lang));
      setBusyId(null);
    }
  }

  async function payCash(id: string) {
    setBusyId(id);
    const { error } = await supabase.rpc("kerreore_set_payment_method", { p_booking_id: id, p_method: "cash" });
    setMsg(error ? translateError(error.message, lang) : t(lang, "bookings_cash_confirmed"));
    setPayingId(null); setBusyId(null);
    load();
  }

  async function payBank(id: string) {
    setBusyId(id);
    const { error } = await supabase.rpc("kerreore_set_payment_method", { p_booking_id: id, p_method: "bank_transfer" });
    if (error) { setMsg(translateError(error.message, lang)); setBusyId(null); return; }
    const { data, error: instrError } = await supabase.rpc("kerreore_get_payment_instructions", { p_booking_id: id });
    const row = Array.isArray(data) ? data[0] : data;
    if (instrError || !row?.bank_iban) setBankInfo((s) => ({ ...s, [id]: null }));
    else setBankInfo((s) => ({ ...s, [id]: { iban: row.bank_iban, holder: row.bank_holder_name } }));
    setPayingId(null); setBusyId(null);
    load();
  }

  if (loading) return <main className="grid min-h-screen place-items-center">{t(lang, "car_loading")}</main>;

  return (
    <main className="min-h-screen bg-[#f7f7f4]">
      <header className="border-b border-black/8 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold"><ArrowLeft size={16}/> {t(lang, "nav_home")}</Link>
          <div className="flex items-center gap-3"><LanguageSwitcher/><Link href="/cars" className="rounded-full border border-black/10 px-4 py-2 text-sm font-bold">{t(lang, "nav_browse")}</Link></div>
        </div>
      </header>
      <section className="mx-auto max-w-5xl px-5 py-10">
        <p className="text-xs font-black uppercase tracking-[.18em] text-black/40">{t(lang, "bookings_label")}</p>
        <h1 className="mt-2 text-4xl font-black">{t(lang, "bookings_title")}</h1>
        {msg && <p className="mt-5 rounded-2xl bg-[#f5f5f0] p-4 text-sm font-bold">{msg}</p>}
        <div className="mt-8 space-y-3">
          {rows.map((b) => {
            const canPay = b.payment_status === "unpaid" && (b.status === "pending" || b.status === "confirmed");
            const payBadge = b.payment_status === "paid" ? t(lang, "bookings_payment_paid") : b.payment_provider === "cash" ? t(lang, "bookings_payment_cash_pending") : b.payment_provider === "bank_transfer" ? t(lang, "bookings_payment_bank_pending") : t(lang, "bookings_payment_unpaid");
            const bank = bankInfo[b.id];
            return (
              <div key={b.id} className="rounded-3xl border border-black/8 bg-white p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-black">{b.kerreore_vehicles?.make} {b.kerreore_vehicles?.model}</p>
                    <p className="mt-1 text-sm text-black/50">{new Date(b.starts_at).toLocaleString([], { timeZone: KOSOVO_TZ })} → {new Date(b.ends_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", timeZone: KOSOVO_TZ })}</p>
                    <p className="mt-1 text-xs text-black/40">· €{b.total_amount} · {payBadge}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#f5f5f0] px-3 py-1.5 text-xs font-black">{t(lang, `status_${b.status}`)}</span>
                    {canPay && payingId !== b.id && (
                      <button onClick={() => setPayingId(b.id)} className="rounded-full bg-[#b7ff3c] px-3 py-2 text-xs font-black">{t(lang, "bookings_pay_now")}</button>
                    )}
                    {(b.status === "pending" || b.status === "confirmed") && (
                      <button onClick={() => cancel(b.id)} className="rounded-full border border-red-200 px-3 py-2 text-xs font-bold text-red-700"><XCircle className="mr-1 inline" size={14}/> {t(lang, "bookings_cancel")}</button>
                    )}
                  </div>
                </div>
                {canPay && payingId === b.id && (
                  <div className="mt-4 flex flex-col gap-2 rounded-2xl bg-[#f7f7f4] p-4 sm:flex-row">
                    <button disabled={busyId === b.id} onClick={() => payCard(b.id)} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-black text-white disabled:opacity-50"><CreditCard size={16}/> {t(lang, "bookings_pay_card")}</button>
                    <button disabled={busyId === b.id} onClick={() => payBank(b.id)} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-black disabled:opacity-50"><Landmark size={16}/> {t(lang, "bookings_pay_bank")}</button>
                    <button disabled={busyId === b.id} onClick={() => payCash(b.id)} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-black disabled:opacity-50"><Banknote size={16}/> {t(lang, "bookings_pay_cash")}</button>
                  </div>
                )}
                {b.payment_provider === "bank_transfer" && b.payment_status === "unpaid" && (
                  bank ? (
                    <div className="mt-4 rounded-2xl border border-black/10 bg-[#f7f7f4] p-4 text-sm">
                      <p className="font-black">{t(lang, "bank_instructions_title")}</p>
                      <p className="mt-2">{t(lang, "bank_holder")}: <b>{bank.holder}</b></p>
                      <p className="mt-1">IBAN: <b className="font-mono">{bank.iban}</b></p>
                      <p className="mt-1">{t(lang, "bank_reference")}: <b className="font-mono">{b.id.slice(0, 8).toUpperCase()}</b></p>
                      <p className="mt-2 text-xs text-black/45">{t(lang, "bank_instructions_note")}</p>
                    </div>
                  ) : bank === null ? (
                    <p className="mt-4 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{t(lang, "bank_not_set_up")}</p>
                  ) : null
                )}
              </div>
            );
          })}
          {!rows.length && <div className="rounded-3xl border border-dashed border-black/15 bg-white p-12 text-center text-sm text-black/45">{t(lang, "bookings_none")} <Link href="/cars" className="font-bold underline">{t(lang, "bookings_browse")}</Link></div>}
        </div>
      </section>
    </main>
  );
}
