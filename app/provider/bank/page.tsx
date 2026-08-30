"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";
import { useLang } from "@/lib/i18n/lang-client";
import { t } from "@/lib/i18n/dictionary";
import { translateError } from "@/lib/i18n/errors";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function BankDetailsPage() {
  const lang = useLang();
  const supabase = createClient();
  const [iban, setIban] = useState("");
  const [holder, setHolder] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => { (async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { location.href = "/login"; return; }
    const { data } = await supabase.from("kerreore_profiles").select("bank_iban,bank_holder_name").eq("id", user.id).single();
    setIban(data?.bank_iban ?? ""); setHolder(data?.bank_holder_name ?? "");
    setLoading(false);
  })(); }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg("");
    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) { location.href = "/login"; return; }
    // IMPORTANT: .select().single() after .update() is required here, not
    // optional -- without it, supabase-js/PostgREST returns success even
    // when RLS or an auth mismatch causes zero rows to actually match the
    // update, silently discarding the write while still reporting "saved".
    // .single() forces a real error when the affected-row count isn't
    // exactly 1, so a genuine failure is never shown to the user as success.
    const { data, error } = await supabase
      .from("kerreore_profiles")
      .update({ bank_iban: iban.trim(), bank_holder_name: holder.trim() })
      .eq("id", user.id)
      .select("id,bank_iban,bank_holder_name")
      .single();
    if (error || !data) setMsg(translateError(error?.message || "permission denied", lang));
    else setMsg(t(lang, "bank_saved"));
    setBusy(false);
  }

  if (loading) return <main className="grid min-h-screen place-items-center">{t(lang, "car_loading")}</main>;

  return (
    <main className="min-h-screen bg-[#f7f7f4]">
      <header className="border-b border-black/8 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-5">
          <Link href="/provider" className="flex items-center gap-2 text-sm font-bold"><ArrowLeft size={16}/> {t(lang, "provider_dashboard_label")}</Link>
          <LanguageSwitcher />
        </div>
      </header>
      <section className="mx-auto max-w-3xl px-5 py-10">
        <p className="text-xs font-black uppercase tracking-[.18em] text-black/40">{t(lang, "bank_label")}</p>
        <h1 className="mt-2 text-4xl font-black tracking-[-.05em]">{t(lang, "bank_title")}</h1>
        <p className="mt-3 text-black/50">{t(lang, "bank_subtitle")}</p>
        <form onSubmit={save} className="mt-8 space-y-4 rounded-[2rem] border border-black/8 bg-white p-6">
          <label className="block text-sm font-bold">{t(lang, "bank_holder")}
            <input value={holder} onChange={(e) => setHolder(e.target.value)} required className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f7f7f4] p-4" />
          </label>
          <label className="block text-sm font-bold">IBAN
            <input value={iban} onChange={(e) => setIban(e.target.value)} required placeholder="XK05 1234 5678 9012 3456" className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f7f7f4] p-4 font-mono" />
          </label>
          {msg && <p className="rounded-2xl bg-[#f5f5f0] p-4 text-sm font-bold">{msg}</p>}
          <button disabled={busy} className="w-full rounded-2xl bg-black py-4 font-black text-white disabled:opacity-50"><Save className="mr-2 inline" size={16}/>{busy ? t(lang, "manage_saving") : t(lang, "bank_save")}</button>
        </form>
      </section>
    </main>
  );
}
