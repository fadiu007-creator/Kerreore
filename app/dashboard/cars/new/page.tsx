"use client";
import { useRef, useState } from "react";
import { ArrowLeft, CarFront, ImagePlus, X } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/browser";
import { useLang } from "@/lib/i18n/lang-client";
import { t } from "@/lib/i18n/dictionary";
import { translateError } from "@/lib/i18n/errors";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function NewCarPage() {
  const lang = useLang();
  const supabase = createClient();
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setError("");
    const f = new FormData(e.currentTarget);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { location.href = "/login"; return; }
    const { data: car, error: ce } = await supabase.from("kerreore_vehicles").insert({
      owner_id: user.id, make: f.get("make"), model: f.get("model"), year: Number(f.get("year")),
      hourly_rate: Number(f.get("rate")), location: f.get("location"), description: f.get("description"),
      transmission: f.get("transmission"), fuel: f.get("fuel"), seats: Number(f.get("seats")), published: false,
    }).select().single();
    if (ce || !car) { setError(translateError(ce?.message, lang)); setBusy(false); return; }
    const rules = [0,1,2,3,4,5,6].map((weekday) => ({ vehicle_id: car.id, weekday, start_time: f.get(`start_${weekday}`), end_time: f.get(`end_${weekday}`) }));
    const { error: ae } = await supabase.from("kerreore_availability_rules").insert(rules);
    if (ae) { setError(translateError(ae.message, lang)); setBusy(false); return; }
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const path = `${user.id}/${car.id}/${Date.now()}-${i}-${safe}`;
      const up = await supabase.storage.from("kerreore-vehicles").upload(path, file, { upsert: false, contentType: file.type });
      if (up.error) { setError(translateError(up.error.message, lang)); setBusy(false); return; }
      const { error: ie } = await supabase.from("kerreore_vehicle_images").insert({ vehicle_id: car.id, storage_path: path, sort_order: i });
      if (ie) { setError(translateError(ie.message, lang)); setBusy(false); return; }
    }
    location.href = "/provider";
  }

  return (
    <main className="min-h-screen bg-[#f7f7f4]">
      <header className="border-b border-black/8 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
          <Link href="/provider" className="text-2xl font-black tracking-[-.06em]">kerreore<span className="text-lime-500">.</span></Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link href="/provider" className="flex items-center gap-2 text-sm font-bold"><ArrowLeft size={16}/> {t(lang, "new_car_cancel")}</Link>
          </div>
        </div>
      </header>
      <section className="mx-auto max-w-5xl px-5 py-10">
        <p className="text-xs font-black uppercase tracking-[.18em] text-black/40">{t(lang, "new_car_label")}</p>
        <h1 className="mt-2 text-4xl font-black tracking-[-.05em]">{t(lang, "new_car_title")}</h1>
        <p className="mt-3 text-black/50">{t(lang, "new_car_subtitle")}</p>
        <form onSubmit={submit} className="mt-8 space-y-6 rounded-[2rem] border border-black/8 bg-white p-6 md:p-8">
          <div className="grid gap-4 md:grid-cols-2">
            {[["make", t(lang, "new_car_make"), "Volkswagen"], ["model", t(lang, "new_car_model"), "Golf 8"], ["year", t(lang, "new_car_year"), "2023"], ["rate", t(lang, "new_car_rate"), "15"], ["location", t(lang, "new_car_location"), "Prishtin\u00eb"], ["seats", t(lang, "new_car_seats"), "5"]].map(([n, l, p]) => (
              <label key={n} className="text-sm font-bold">{l}<input name={n} required type={n === "year" || n === "rate" || n === "seats" ? "number" : "text"} min={n === "rate" || n === "seats" ? "1" : undefined} className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f7f7f4] p-4 outline-none" placeholder={p}/></label>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-bold">{t(lang, "new_car_transmission")}<select name="transmission" className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f7f7f4] p-4"><option>Automatic</option><option>Manual</option></select></label>
            <label className="text-sm font-bold">{t(lang, "new_car_fuel")}<select name="fuel" className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f7f7f4] p-4"><option>Petrol</option><option>Diesel</option><option>Hybrid</option><option>Electric</option></select></label>
          </div>
          <label className="text-sm font-bold">{t(lang, "new_car_description")}<textarea name="description" rows={4} className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f7f7f4] p-4" placeholder={t(lang, "new_car_description_ph")}/></label>
          <div>
            <p className="text-sm font-black">{t(lang, "new_car_weekly_availability")}</p>
            <div className="mt-3 space-y-2">{[0,1,2,3,4,5,6].map((i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_1fr] items-center gap-2 rounded-2xl bg-[#f7f7f4] p-3 text-sm">
                <span className="font-bold">{t(lang, `day_${i}`)}</span>
                <input name={`start_${i}`} type="time" defaultValue="08:00" className="rounded-xl border border-black/10 bg-white p-2"/>
                <input name={`end_${i}`} type="time" defaultValue="22:00" className="rounded-xl border border-black/10 bg-white p-2"/>
              </div>
            ))}</div>
          </div>
          <div>
            <p className="text-sm font-black">{t(lang, "new_car_photos")}</p>
            <div className="mt-3 rounded-3xl border border-dashed border-black/15 bg-[#f7f7f4] p-6">
              <input ref={input} type="file" accept="image/*" multiple className="hidden" onChange={(e) => setFiles(Array.from(e.target.files || []).slice(0, 8))}/>
              <button type="button" onClick={() => input.current?.click()} className="rounded-2xl bg-white px-4 py-3 font-black"><ImagePlus className="mr-2 inline" size={17}/> {t(lang, "new_car_choose_photos")}</button>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">{files.map((file, i) => <div key={i} className="rounded-2xl bg-white p-2 text-xs font-bold">{file.name}<button type="button" onClick={() => setFiles(files.filter((_, j) => j !== i))} className="float-right"><X size={14}/></button></div>)}</div>
            </div>
          </div>
          {error && <p className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p>}
          <button disabled={busy} className="w-full rounded-2xl bg-black px-6 py-4 font-black text-white disabled:opacity-50">{busy ? t(lang, "new_car_submitting") : <><CarFront className="mr-2 inline" size={17}/> {t(lang, "new_car_submit")}</>}</button>
        </form>
      </section>
    </main>
  );
}
