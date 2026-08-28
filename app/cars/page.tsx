import { ArrowLeft, CarFront, MapPin } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getServerLang } from "@/lib/i18n/lang-server";
import { t } from "@/lib/i18n/dictionary";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default async function CarsPage() {
  const lang = await getServerLang();
  const supabase = await createClient();
  const { data: cars } = await supabase.from("kerreore_vehicles").select("id,make,model,year,hourly_rate,location,transmission,fuel,seats,description").eq("published", true).order("created_at", { ascending: false });
  const ids = (cars ?? []).map((c) => c.id);
  const { data: images } = ids.length ? await supabase.from("kerreore_vehicle_images").select("vehicle_id,storage_path,sort_order").in("vehicle_id", ids).order("sort_order") : ({ data: [] } as any);
  const firstImage = new Map<string, string>();
  (images ?? []).forEach((i: any) => { if (!firstImage.has(String(i.vehicle_id))) firstImage.set(String(i.vehicle_id), `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/kerreore-vehicles/${i.storage_path}`); });
  return (
    <main className="min-h-screen bg-[#f7f7f4]">
      <header className="border-b border-black/8 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-8">
          <Link href="/" className="text-2xl font-black tracking-[-.06em]">kerreore<span className="text-lime-500">.</span></Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link href="/" className="flex items-center gap-2 text-sm font-bold"><ArrowLeft size={16}/> {t(lang, "nav_home")}</Link>
          </div>
        </div>
      </header>
      <section className="mx-auto max-w-7xl px-5 py-10 md:px-8">
        <div className="flex items-end justify-between gap-6">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-black/50"><MapPin size={16}/> {t(lang, "cars_kosovo")}</div>
            <h1 className="text-4xl font-black tracking-[-.05em] md:text-5xl">{t(lang, "cars_title")}</h1>
            <p className="mt-3 text-black/50">{t(lang, "cars_subtitle")}</p>
          </div>
          <Link href="/login" className="rounded-full bg-black px-5 py-3 text-sm font-black text-white">{t(lang, "nav_list_car")}</Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {(cars ?? []).map((car) => {
            const image = firstImage.get(car.id);
            return (
              <Link href={`/cars/${car.id}`} key={car.id} className="group overflow-hidden rounded-3xl border border-black/8 bg-white transition hover:-translate-y-1 hover:shadow-xl">
                <div className="relative aspect-[4/3] overflow-hidden bg-[#e8e8e2]">
                  {image ? <img src={image} alt={`${car.make} ${car.model}`} className="h-full w-full object-cover transition duration-500 group-hover:scale-105"/> : <div className="grid h-full place-items-center"><CarFront size={44}/></div>}
                  <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-black">{t(lang, "cars_approved")}</span>
                  <span className="absolute right-4 top-4 rounded-full bg-black/80 px-3 py-1.5 text-xs font-black text-white">€{car.hourly_rate}/h</span>
                </div>
                <div className="p-5">
                  <h2 className="font-black">{car.make} {car.model}</h2>
                  <p className="mt-1 text-sm text-black/50">{car.year} · {car.transmission} · {car.fuel} · {car.seats} {t(lang, "home_seats")}</p>
                  <div className="mt-5 flex items-center justify-between border-t border-black/8 pt-4">
                    <span className="text-sm text-black/50">{car.location}</span>
                    <span className="text-sm font-black">{t(lang, "cars_book")} →</span>
                  </div>
                </div>
              </Link>
            );
          })}
          {!cars?.length && <div className="rounded-3xl border border-dashed border-black/15 bg-white p-12 text-center sm:col-span-2 lg:col-span-3"><p className="font-black">{t(lang, "cars_no_cars_title")}</p><p className="mt-2 text-sm text-black/45">{t(lang, "cars_no_cars_desc")}</p></div>}
        </div>
      </section>
    </main>
  );
}
