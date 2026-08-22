import { ArrowRight, CalendarDays, CarFront, MapPin, ShieldCheck, Star } from "lucide-react";

const cars = [
  { name: "Volkswagen Golf 8", meta: "2023 · Automatic · 5 seats", price: 8, image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1200&q=80", rating: "4.9" },
  { name: "BMW 3 Series", meta: "2022 · Automatic · 5 seats", price: 12, image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80", rating: "4.8" },
  { name: "Mercedes-Benz A-Class", meta: "2024 · Automatic · 5 seats", price: 14, image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80", rating: "5.0" },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6 md:px-8">
        <div className="text-2xl font-black tracking-[-0.06em]">kerreore<span className="text-lime-500">.</span></div>
        <div className="hidden items-center gap-8 text-sm font-semibold md:flex">
          <a href="#cars" className="hover:opacity-60">Find a car</a>
          <a href="#how" className="hover:opacity-60">How it works</a>
          <a href="#owner" className="hover:opacity-60">List your car</a>
        </div>
        <button className="rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-bold shadow-sm">Sign in</button>
      </nav>

      <section className="mx-auto max-w-7xl px-5 pb-16 pt-8 md:px-8 md:pt-16">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#171814] px-6 py-14 text-white md:px-12 md:py-20">
          <div className="relative z-10 max-w-3xl">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white/80"><CarFront size={15}/> Cars by the hour</p>
            <h1 className="text-5xl font-black leading-[0.95] tracking-[-0.06em] md:text-7xl">Your next drive<br/><span className="text-[#b7ff3c]">is closer than you think.</span></h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-white/65 md:text-lg">Rent great cars from people around you. Book only the hours you need, without the rental-counter hassle.</p>
          </div>
          <div className="pointer-events-none absolute -right-24 -top-20 h-80 w-80 rounded-full bg-[#b7ff3c]/15 blur-3xl" />
        </div>

        <div className="relative z-20 mx-3 -mt-8 rounded-3xl border border-black/5 bg-white p-3 shadow-[0_20px_60px_rgba(0,0,0,.12)] md:mx-10 md:p-4">
          <div className="grid gap-2 md:grid-cols-[1.3fr_1fr_1fr_auto]">
            <div className="rounded-2xl bg-[#f5f5f0] p-4"><div className="mb-1 text-xs font-bold text-black/45">WHERE</div><div className="flex items-center gap-2 font-bold"><MapPin size={17}/> Pristina, Kosovo</div></div>
            <div className="rounded-2xl bg-[#f5f5f0] p-4"><div className="mb-1 text-xs font-bold text-black/45">WHEN</div><div className="flex items-center gap-2 font-bold"><CalendarDays size={17}/> Today</div></div>
            <div className="rounded-2xl bg-[#f5f5f0] p-4"><div className="mb-1 text-xs font-bold text-black/45">DURATION</div><div className="font-bold">2 hours</div></div>
            <button className="rounded-2xl bg-[#b7ff3c] px-7 py-4 font-black transition hover:scale-[1.02]">Search cars</button>
          </div>
        </div>
      </section>

      <section id="cars" className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-20">
        <div className="mb-8 flex items-end justify-between"><div><p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-black/40">Near you</p><h2 className="text-3xl font-black tracking-[-0.04em] md:text-4xl">Cars ready to drive</h2></div><button className="hidden items-center gap-2 text-sm font-bold md:flex">View all <ArrowRight size={16}/></button></div>
        <div className="grid gap-5 md:grid-cols-3">
          {cars.map((car) => <article key={car.name} className="group overflow-hidden rounded-3xl border border-black/8 bg-white">
            <div className="relative aspect-[4/3] overflow-hidden bg-[#e8e8e2]"><img src={car.image} alt={car.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105"/><div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-black backdrop-blur">Available now</div></div>
            <div className="p-5"><div className="flex items-start justify-between gap-4"><div><h3 className="font-black">{car.name}</h3><p className="mt-1 text-sm text-black/50">{car.meta}</p></div><div className="flex items-center gap-1 text-sm font-bold"><Star size={14} fill="currentColor"/> {car.rating}</div></div><div className="mt-5 flex items-end justify-between border-t border-black/8 pt-4"><div><span className="text-2xl font-black">€{car.price}</span><span className="text-sm text-black/45"> / hour</span></div><button className="rounded-full bg-black px-4 py-2 text-sm font-bold text-white">View car</button></div></div>
          </article>)}
        </div>
      </section>

      <section id="how" className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-20">
        <div className="rounded-[2rem] border border-black/8 bg-white p-7 md:p-12"><div className="grid gap-10 md:grid-cols-3"><div><ShieldCheck size={25}/><h3 className="mt-5 text-xl font-black">Built around trust</h3><p className="mt-2 text-sm leading-6 text-black/55">Clear profiles, vehicle details and reviews help you choose with confidence.</p></div><div><CalendarDays size={25}/><h3 className="mt-5 text-xl font-black">Only pay for the time</h3><p className="mt-2 text-sm leading-6 text-black/55">Pick the exact hours you need instead of paying for an entire day.</p></div><div><CarFront size={25}/><h3 className="mt-5 text-xl font-black">Cars from your community</h3><p className="mt-2 text-sm leading-6 text-black/55">Local owners turn unused car time into flexible income.</p></div></div></div>
      </section>

      <section id="owner" className="mx-auto max-w-7xl px-5 pb-20 md:px-8"><div className="rounded-[2rem] bg-[#b7ff3c] p-8 md:flex md:items-center md:justify-between md:p-12"><div><p className="text-xs font-black uppercase tracking-[0.18em]">For owners</p><h2 className="mt-3 text-3xl font-black tracking-[-0.04em]">Your car could be earning<br/>while you’re not driving it.</h2></div><button className="mt-7 rounded-full bg-black px-6 py-3.5 text-sm font-black text-white md:mt-0">List your car <ArrowRight className="ml-2 inline" size={16}/></button></div></section>
      <footer className="border-t border-black/8 px-5 py-8 text-sm text-black/45"><div className="mx-auto flex max-w-7xl justify-between"><span className="font-black text-black">kerreore.</span><span>Peer-to-peer car rental</span></div></footer>
    </main>
  );
}
