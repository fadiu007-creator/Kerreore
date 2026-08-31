import { ArrowRight, CalendarDays, CarFront, MapPin, ShieldCheck, Star } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getServerLang } from "@/lib/i18n/lang-server";
import { t } from "@/lib/i18n/dictionary";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default async function Home() {
  const lang = await getServerLang();
  const supabase = await createClient();
  const { data: cars } = await supabase
    .from("kerreore_vehicles")
    .select("id,make,model,year,hourly_rate,location,transmission,fuel,seats")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(3);
  const ids = (cars ?? []).map((c) => c.id);
  const { data: images } = ids.length
    ? await supabase.from("kerreore_vehicle_images").select("vehicle_id,storage_path,sort_order").in("vehicle_id", ids).order("sort_order")
    : ({ data: [] } as any);
  const { data: reviews } = ids.length
    ? await supabase.from("kerreore_reviews").select("vehicle_id,rating").in("vehicle_id", ids).eq("direction", "renter_to_owner")
    : ({ data: [] } as any);
  const firstImage = new Map<string, string>();
  (images ?? []).forEach((i: any) => { if (!firstImage.has(String(i.vehicle_id))) firstImage.set(String(i.vehicle_id), `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/kerreore-vehicles/${i.storage_path}`); });
  const ratingByVehicle = new Map<string, { avg: number; count: number }>();
  (reviews ?? []).forEach((r: any) => {
    const cur = ratingByVehicle.get(r.vehicle_id) ?? { avg: 0, count: 0 };
    ratingByVehicle.set(r.vehicle_id, { avg: (cur.avg * cur.count + r.rating) / (cur.count + 1), count: cur.count + 1 });
  });

  return (
    <main className="min-h-screen overflow-hidden">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6 md:px-8">
        <Link href="/" className="text-2xl font-black tracking-[-0.06em]">kerreore<span className="text-lime-500">.</span></Link>
        <div className="hidden items-center gap-8 text-sm font-semibold md:flex">
          <Link href="/cars" className="hover:opacity-60">{t(lang, "nav_find_car")}</Link>
          <a href="#how" className="hover:opacity-60">{t(lang, "nav_how")}</a>
          <a href="#owner" className="hover:opacity-60">{t(lang, "nav_list_car")}</a>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link href="/login" className="rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-bold shadow-sm">{t(lang, "nav_sign_in")}</Link>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-5 pb-16 pt-8 md:px-8 md:pt-16">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#171814] px-6 py-14 text-white md:px-12 md:py-20">
          <div className="relative z-10 max-w-3xl">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white/80"><CarFront size={15}/> {t(lang, "home_badge")}</p>
            <h1 className="text-5xl font-black leading-[0.95] tracking-[-0.06em] md:text-7xl">{t(lang, "home_title_1")}<br/><span className="text-[#b7ff3c]">{t(lang, "home_title_2")}</span></h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-white/65 md:text-lg">{t(lang, "home_subtitle")}</p>
          </div>
          <div className="pointer-events-none absolute -right-24 -top-20 h-80 w-80 rounded-full bg-[#b7ff3c]/15 blur-3xl" />
        </div>
        <div className="relative z-20 mx-3 -mt-8 rounded-3xl border border-black/5 bg-white p-3 shadow-[0_20px_60px_rgba(0,0,0,.12)] md:mx-10 md:p-4">
          <div className="grid gap-2 md:grid-cols-[1.3fr_1fr_1fr_auto]">
            <div className="rounded-2xl bg-[#f5f5f0] p-4"><div className="mb-1 text-xs font-bold text-black/45">{t(lang, "home_where_label")}</div><div className="flex items-center gap-2 font-bold"><MapPin size={17}/> {t(lang, "home_where_value")}</div></div>
            <div className="rounded-2xl bg-[#f5f5f0] p-4"><div className="mb-1 text-xs font-bold text-black/45">{t(lang, "home_when_label")}</div><div className="flex items-center gap-2 font-bold"><CalendarDays size={17}/> {t(lang, "home_when_value")}</div></div>
            <div className="rounded-2xl bg-[#f5f5f0] p-4"><div className="mb-1 text-xs font-bold text-black/45">{t(lang, "home_duration_label")}</div><div className="font-bold">{t(lang, "home_duration_value")}</div></div>
            <Link href="/cars" className="rounded-2xl bg-[#b7ff3c] px-7 py-4 text-center font-black transition hover:scale-[1.02]">{t(lang, "home_search_cars")}</Link>
          </div>
        </div>
      </section>

      <section id="cars" className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-20">
        <div className="mb-8 flex items-end justify-between">
          <div><p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-black/40">{t(lang, "home_near_you")}</p><h2 className="text-3xl font-black tracking-[-0.04em] md:text-4xl">{t(lang, "home_cars_ready")}</h2></div>
          <Link href="/cars" className="hidden items-center gap-2 text-sm font-bold md:flex">{t(lang, "home_view_all")} <ArrowRight size={16}/></Link>
        </div>
        {cars?.length ? (
          <div className="grid gap-5 md:grid-cols-3">
            {cars.map((car) => {
              const image = firstImage.get(car.id);
              const rating = ratingByVehicle.get(car.id);
              return (
                <Link href={`/cars/${car.id}`} key={car.id} className="group overflow-hidden rounded-3xl border border-black/8 bg-white">
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#e8e8e2]">
                    {image ? <img src={image} alt={`${car.make} ${car.model}`} className="h-full w-full object-cover transition duration-500 group-hover:scale-105"/> : <div className="grid h-full place-items-center"><CarFront size={44}/></div>}
                    <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-black backdrop-blur">{t(lang, "home_available_now")}</div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div><h3 className="font-black">{car.make} {car.model}</h3><p className="mt-1 text-sm text-black/50">{car.year} \u00b7 {car.transmission} \u00b7 {car.seats} {t(lang, "home_seats")}</p></div>
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-xs font-bold">
                      {rating ? (<><Star size={13} fill="currentColor"/> {rating.avg.toFixed(1)} \u00b7 {t(lang, "car_reviews_count", rating.count)}</>) : <span className="text-black/40">{t(lang, "car_no_reviews")}</span>}
                    </div>
                    <div className="mt-3 flex items-end justify-between border-t border-black/8 pt-4">
                      <div><span className="text-2xl font-black">\u20ac{car.hourly_rate}</span><span className="text-sm text-black/45"> {t(lang, "home_per_hour")}</span></div>
                      <span className="rounded-full bg-black px-4 py-2 text-sm font-bold text-white">{t(lang, "home_view_car")}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-black/15 bg-white p-12 text-center"><p className="font-black">{t(lang, "cars_no_cars_title")}</p><p className="mt-2 text-sm text-black/45">{t(lang, "cars_no_cars_desc")}</p></div>
        )}
      </section>

      <section id="how" className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-20">
        <div className="rounded-[2rem] border border-black/8 bg-white p-7 md:p-12">
          <div className="grid gap-10 md:grid-cols-3">
            <div><ShieldCheck size={25}/><h3 className="mt-5 text-xl font-black">{t(lang, "home_trust_title")}</h3><p className="mt-2 text-sm leading-6 text-black/55">{t(lang, "home_trust_desc")}</p></div>
            <div><CalendarDays size={25}/><h3 className="mt-5 text-xl font-black">{t(lang, "home_time_title")}</h3><p className="mt-2 text-sm leading-6 text-black/55">{t(lang, "home_time_desc")}</p></div>
            <div><CarFront size={25}/><h3 className="mt-5 text-xl font-black">{t(lang, "home_community_title")}</h3><p className="mt-2 text-sm leading-6 text-black/55">{t(lang, "home_community_desc")}</p></div>
          </div>
        </div>
      </section>
      <section id="owner" className="mx-auto max-w-7xl px-5 pb-20 md:px-8">
        <div className="rounded-[2rem] bg-[#b7ff3c] p-8 md:flex md:items-center md:justify-between md:p-12">
          <div><p className="text-xs font-black uppercase tracking-[0.18em]">{t(lang, "home_owner_badge")}</p><h2 className="mt-3 text-3xl font-black tracking-[-0.04em]">{t(lang, "home_owner_title")}</h2></div>
          <Link href="/dashboard/cars/new" className="mt-7 rounded-full bg-black px-6 py-3.5 text-sm font-black text-white md:mt-0">{t(lang, "home_owner_cta")} <ArrowRight className="ml-2 inline" size={16}/></Link>
        </div>
      </section>
      <footer className="border-t border-black/8 px-5 py-8 text-sm text-black/45">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <span className="font-black text-black">kerreore.</span>
          <span>{t(lang, "home_footer")}</span>
          <div className="flex gap-4 text-xs font-bold"><Link href="/terms" className="hover:underline">{t(lang, "nav_terms")}</Link><Link href="/privacy" className="hover:underline">{t(lang, "nav_privacy")}</Link></div>
        </div>
      </footer>
    </main>
  );
}
