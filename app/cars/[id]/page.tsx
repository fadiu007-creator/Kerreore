"use client";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CarFront, Check, Clock3, MapPin, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { useLang } from "@/lib/i18n/lang-client";
import { t } from "@/lib/i18n/dictionary";
import { translateError } from "@/lib/i18n/errors";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function CarDetail() {
  const { id } = useParams<{ id: string }>();
  const lang = useLang();
  const supabase = createClient();
  const [car, setCar] = useState<any>(null);
  const [images, setImages] = useState<any[]>([]);
  const [date, setDate] = useState("");
  const [start, setStart] = useState("10:00");
  const [duration, setDuration] = useState(2);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const d = new Date(); d.setDate(d.getDate() + 1); setDate(d.toISOString().slice(0, 10));
    (async () => {
      const { data } = await supabase.from("kerreore_vehicles").select("*").eq("id", id).eq("published", true).single();
      if (!data) { setNotFound(true); return; }
      setCar(data);
      const { data: ims } = await supabase.from("kerreore_vehicle_images").select("storage_path").eq("vehicle_id", id).order("sort_order");
      setImages((ims ?? []).map((i) => `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/kerreore-vehicles/${i.storage_path}`));
    })();
  }, [id]);

  const total = useMemo(() => (car ? Number(car.hourly_rate) * duration : 0), [car, duration]);

  async function book() {
    setBusy(true); setMsg("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { location.href = `/login?next=/cars/${id}`; return; }
    const starts = new Date(`${date}T${start}:00+02:00`);
    const ends = new Date(starts.getTime() + duration * 3600000);
    const { error } = await supabase.rpc("kerreore_create_booking", { p_vehicle_id: id, p_starts_at: starts.toISOString(), p_ends_at: ends.toISOString() });
    if (error) setMsg(translateError(error.message, lang));
    else { setMsg(t(lang, "car_booking_created")); setTimeout(() => (location.href = "/bookings"), 700); }
    setBusy(false);
  }

  if (notFound) return <main className="min-h-screen bg-[#f7f7f4]"><header className="border-b border-black/8 bg-white p-5"><Link href="/cars" className="flex items-center gap-2 text-sm font-bold"><ArrowLeft size={16}/> {t(lang, "nav_cars")}</Link></header><div className="mx-auto max-w-3xl px-5 py-16 text-center">{t(lang, "car_not_available")}</div></main>;
  if (!car) return <main className="min-h-screen bg-[#f7f7f4]"><header className="border-b border-black/8 bg-white p-5"><Link href="/cars" className="flex items-center gap-2 text-sm font-bold"><ArrowLeft size={16}/> {t(lang, "nav_cars")}</Link></header><div className="mx-auto max-w-3xl px-5 py-16 text-center">{t(lang, "car_loading")}</div></main>;

  return (
    <main className="min-h-screen bg-[#f7f7f4] pb-16">
      <header className="border-b border-black/8 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
          <Link href="/" className="text-2xl font-black tracking-[-.06em]">kerreore<span className="text-lime-500">.</span></Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link href="/cars" className="flex items-center gap-2 text-sm font-bold"><ArrowLeft size={16}/> {t(lang, "nav_back")}</Link>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-5 pt-7">
        <div className="grid gap-6 lg:grid-cols-[1.35fr_.65fr]">
          <section>
            <div className="overflow-hidden rounded-[2rem] bg-[#e8e8e2]">
              {images[0] ? <img src={images[0]} alt={`${car.make} ${car.model}`} className="aspect-[4/3] h-full w-full object-cover"/> : <div className="grid aspect-[4/3] place-items-center"><CarFront size={64}/></div>}
            </div>
            <div className="mt-5 grid grid-cols-4 gap-2">{images.slice(0, 4).map((src, i) => <img key={i} src={src} alt="" className="aspect-square rounded-2xl object-cover"/>)}</div>
          </section>
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-[2rem] border border-black/8 bg-white p-6 shadow-xl">
              <p className="text-sm font-bold text-black/45">{car.location} \u00b7 {car.year}</p>
              <h1 className="mt-1 text-3xl font-black">{car.make} {car.model}</h1>
              <p className="mt-4 text-sm leading-6 text-black/55">{car.description || t(lang, "car_default_description")}</p>
              <div className="mt-5 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-2xl bg-[#f5f5f0] p-4"><b>{car.transmission}</b><p className="text-black/45">{t(lang, "car_transmission")}</p></div>
                <div className="rounded-2xl bg-[#f5f5f0] p-4"><b>{car.fuel}</b><p className="text-black/45">{t(lang, "car_fuel")}</p></div>
                <div className="rounded-2xl bg-[#f5f5f0] p-4"><b>{car.seats}</b><p className="text-black/45">{t(lang, "car_seats")}</p></div>
                <div className="rounded-2xl bg-[#f5f5f0] p-4"><b>\u20ac{car.hourly_rate}/h</b><p className="text-black/45">{t(lang, "car_hourly")}</p></div>
              </div>
              <div className="my-6 border-t border-black/8 pt-6">
                <p className="mb-3 text-sm font-black">{t(lang, "car_choose_time")}</p>
                <label className="block rounded-2xl border border-black/10 p-3 text-sm"><span className="block text-xs font-bold text-black/40">{t(lang, "car_date")}</span><input type="date" min={new Date().toISOString().slice(0, 10)} value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 w-full font-bold outline-none"/></label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <label className="rounded-2xl border border-black/10 p-3 text-sm"><span className="block text-xs font-bold text-black/40">{t(lang, "car_start")}</span><input type="time" value={start} onChange={(e) => setStart(e.target.value)} className="mt-1 w-full font-bold outline-none"/></label>
                  <label className="rounded-2xl border border-black/10 p-3 text-sm"><span className="block text-xs font-bold text-black/40">{t(lang, "car_hours")}</span><select value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="mt-1 w-full font-bold outline-none">{[1,2,3,4,5,6,8,12,24].map((n) => <option key={n} value={n}>{n}</option>)}</select></label>
                </div>
                <div className="flex items-end justify-between">
                  <div><span className="text-3xl font-black">\u20ac{total.toFixed(2)}</span><p className="text-xs text-black/40">{duration} {t(lang, "car_hour_unit")} \u00d7 \u20ac{car.hourly_rate}</p></div>
                  <button disabled={busy} onClick={book} className="rounded-2xl bg-[#b7ff3c] px-5 py-4 font-black disabled:opacity-50">{busy ? t(lang, "car_booking_busy") : t(lang, "car_request_booking")}</button>
                </div>
              </div>
              {msg && <p className="mt-4 rounded-2xl bg-[#f5f5f0] p-4 text-sm font-bold">{msg}</p>}
              <div className="mt-5 flex items-center gap-2 text-xs font-bold text-black/45"><ShieldCheck size={15}/> {t(lang, "car_availability_note")}</div>
            </div>
            <div className="mt-3 rounded-3xl border border-black/8 bg-white p-5">
              <p className="flex items-center gap-2 text-sm font-bold"><MapPin size={15}/> {car.location}, {t(lang, "cars_kosovo")}</p>
              <p className="mt-2 flex items-center gap-2 text-sm text-black/50"><Clock3 size={15}/> {t(lang, "car_weekly_note")}</p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
