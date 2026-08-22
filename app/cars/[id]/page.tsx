import { ArrowLeft, Check, ChevronRight, Clock3, MapPin, ShieldCheck, Star, UserRound } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCar } from "@/lib/cars";

export default async function CarDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const car = getCar(id);
  if (!car) notFound();

  return (
    <main className="min-h-screen pb-16">
      <header className="border-b border-black/8 bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-8"><Link href="/" className="text-2xl font-black tracking-[-0.06em]">kerreore<span className="text-lime-500">.</span></Link><Link href="/cars" className="flex items-center gap-2 text-sm font-bold"><ArrowLeft size={16}/> Back to cars</Link></div></header>
      <div className="mx-auto max-w-7xl px-5 pt-7 md:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.35fr_.65fr]">
          <section>
            <div className="overflow-hidden rounded-[2rem] bg-[#e8e8e2]"><img src={car.image} alt={car.name} className="aspect-[4/3] h-full w-full object-cover"/></div>
            <div className="mt-7 flex flex-wrap gap-2">{car.features.map((feature) => <span key={feature} className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-bold"><Check size={14} className="mr-1.5 inline"/>{feature}</span>)}</div>
          </section>

          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-[2rem] border border-black/8 bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,.08)] md:p-7">
              <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-bold text-black/45">{car.make} · {car.year}</p><h1 className="mt-1 text-3xl font-black tracking-[-0.04em]">{car.name}</h1></div><div className="flex items-center gap-1 rounded-full bg-[#f5f5f0] px-3 py-2 text-sm font-black"><Star size={14} fill="currentColor"/> {car.rating}</div></div>
              <p className="mt-4 text-sm leading-6 text-black/55">{car.description}</p>
              <div className="mt-6 grid grid-cols-2 gap-2 text-sm"><div className="rounded-2xl bg-[#f5f5f0] p-4"><b>{car.transmission}</b><p className="mt-1 text-black/45">Transmission</p></div><div className="rounded-2xl bg-[#f5f5f0] p-4"><b>{car.fuel}</b><p className="mt-1 text-black/45">Fuel</p></div><div className="rounded-2xl bg-[#f5f5f0] p-4"><b>{car.seats}</b><p className="mt-1 text-black/45">Seats</p></div><div className="rounded-2xl bg-[#f5f5f0] p-4"><b>€{car.price}/h</b><p className="mt-1 text-black/45">Hourly rate</p></div></div>

              <div className="my-6 border-t border-black/8 pt-6"><p className="mb-3 text-sm font-black">Choose your time</p><div className="grid grid-cols-2 gap-2"><label className="rounded-2xl border border-black/10 p-3 text-sm"><span className="block text-xs font-bold text-black/40">DATE</span><input type="date" className="mt-1 w-full bg-transparent font-bold outline-none" defaultValue="2026-08-23"/></label><label className="rounded-2xl border border-black/10 p-3 text-sm"><span className="block text-xs font-bold text-black/40">START</span><select className="mt-1 w-full bg-transparent font-bold outline-none"><option>10:00</option><option>12:00</option><option>14:00</option><option>16:00</option></select></label></div><div className="mt-2 flex items-center justify-between rounded-2xl bg-[#f5f5f0] p-4 text-sm"><span className="flex items-center gap-2 font-bold"><Clock3 size={16}/> Duration</span><select className="bg-transparent font-black outline-none"><option>2 hours</option><option>3 hours</option><option>4 hours</option><option>6 hours</option><option>8 hours</option></select></div></div>

              <div className="flex items-end justify-between"><div><span className="text-3xl font-black">€{car.price * 2}</span><span className="text-sm text-black/45"> total</span><p className="text-xs text-black/40">€{car.price}/hour × 2 hours</p></div><button className="rounded-2xl bg-[#b7ff3c] px-6 py-4 font-black transition hover:scale-[1.02]">Continue booking <ChevronRight size={17} className="ml-1 inline"/></button></div>
              <div className="mt-5 flex items-center gap-2 text-xs font-bold text-black/45"><ShieldCheck size={15}/> Secure booking · Free cancellation before pickup</div>
            </div>

            <div className="mt-3 rounded-3xl border border-black/8 bg-white p-5"><div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-full bg-[#f0f0ea]"><UserRound size={19}/></div><div><p className="font-black">{car.owner}</p><p className="text-xs text-black/45">Verified owner · {car.reviews} reviews</p></div><div className="ml-auto"><ShieldCheck size={18}/></div></div><p className="mt-4 flex items-center gap-2 text-sm text-black/50"><MapPin size={15}/> {car.location}, Kosovo</p></div>
          </aside>
        </div>
      </div>
    </main>
  );
}
