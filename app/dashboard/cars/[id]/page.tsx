"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { useLang } from "@/lib/i18n/lang-client";
import { t } from "@/lib/i18n/dictionary";
import { translateError } from "@/lib/i18n/errors";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function ManageCar() {
  const { id } = useParams<{ id: string }>();
  const lang = useLang();
  const supabase = createClient();
  const [c, setC] = useState<any>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { (async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { location.href = "/login"; return; }
    const { data, error } = await supabase.from("kerreore_vehicles").select("*").eq("id", id).eq("owner_id", user.id).single();
    if (error) location.href = "/provider"; else setC(data);
  })(); }, [id]);
  if (!c) return <main className="grid min-h-screen place-items-center">{t(lang, "car_loading")}</main>;

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true);
    const f = new FormData(e.currentTarget);
    const { error } = await supabase.from("kerreore_vehicles").update({ make: f.get("make"), model: f.get("model"), year: Number(f.get("year")), hourly_rate: Number(f.get("rate")), location: f.get("location"), description: f.get("description"), transmission: f.get("transmission"), fuel: f.get("fuel"), seats: Number(f.get("seats")) }).eq("id", id);
    if (error) setError(translateError(error.message, lang)); else setError(t(lang, "manage_saved"));
    setBusy(false);
  }
  async function remove() {
    if (!confirm(t(lang, "manage_delete_confirm"))) return;
    const { error } = await supabase.from("kerreore_vehicles").delete().eq("id", id);
    if (error) setError(translateError(error.message, lang)); else location.href = "/provider";
  }
  return (
    <main className="min-h-screen bg-[#f7f7f4]">
      <header className="border-b border-black/8 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-5">
          <Link href="/provider" className="flex items-center gap-2 text-sm font-bold"><ArrowLeft size={16}/> {t(lang, "provider_dashboard_label")}</Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <button onClick={remove} className="rounded-full border border-red-200 px-4 py-2 text-sm font-bold text-red-700"><Trash2 className="mr-1 inline" size={15}/> {t(lang, "manage_delete")}</button>
          </div>
        </div>
      </header>
      <section className="mx-auto max-w-4xl px-5 py-10">
        <p className="text-xs font-black uppercase tracking-[.18em] text-black/40">{t(lang, "manage_label")}</p>
        <h1 className="mt-2 text-4xl font-black">{c.make} {c.model}</h1>
        <form onSubmit={save} className="mt-8 space-y-5 rounded-[2rem] border border-black/8 bg-white p-6">
          <div className="grid gap-4 md:grid-cols-2">{[["make", t(lang, "new_car_make"), c.make], ["model", t(lang, "new_car_model"), c.model], ["year", t(lang, "new_car_year"), c.year], ["rate", t(lang, "new_car_rate"), c.hourly_rate], ["location", t(lang, "new_car_location"), c.location], ["seats", t(lang, "new_car_seats"), c.seats]].map(([n, l, v]) => <label key={n} className="text-sm font-bold">{l}<input name={n} defaultValue={v as any} required type={n === "year" || n === "rate" || n === "seats" ? "number" : "text"} className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f7f7f4] p-4"/></label>)}</div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-bold">{t(lang, "manage_transmission")}<select name="transmission" defaultValue={c.transmission} className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f7f7f4] p-4"><option>Automatic</option><option>Manual</option></select></label>
            <label className="text-sm font-bold">{t(lang, "manage_fuel")}<select name="fuel" defaultValue={c.fuel} className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f7f7f4] p-4"><option>Petrol</option><option>Diesel</option><option>Hybrid</option><option>Electric</option></select></label>
          </div>
          <label className="text-sm font-bold">{t(lang, "manage_description")}<textarea name="description" defaultValue={c.description || ""} rows={5} className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f7f7f4] p-4"/></label>
          {error && <p className="rounded-2xl bg-[#f5f5f0] p-4 text-sm font-bold">{error}</p>}
          <button disabled={busy} className="w-full rounded-2xl bg-black py-4 font-black text-white"><Save className="mr-2 inline" size={16}/>{busy ? t(lang, "manage_saving") : t(lang, "manage_save")}</button>
        </form>
      </section>
    </main>
  );
}
