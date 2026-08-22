import { CalendarDays, CarFront, Clock3, MapPin } from "lucide-react";

const bookings = [
  { id: "KR-2048", car: "Volkswagen Golf 8", date: "Today", time: "14:00–18:00", location: "Pristina", status: "Confirmed", total: 32, image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=900&q=80" },
  { id: "KR-2031", car: "BMW 3 Series", date: "26 Aug", time: "10:00–13:00", location: "Pristina", status: "Completed", total: 36, image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=900&q=80" },
];

export default function BookingsPage() {
  return <main className="mx-auto min-h-screen max-w-6xl px-5 py-8 md:px-8 md:py-12">
    <header className="mb-10 flex items-center justify-between"><a href="/" className="text-2xl font-black tracking-[-.06em]">kerreore<span className="text-lime-500">.</span></a><a href="/dashboard" className="rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-bold">Dashboard</a></header>
    <div className="mb-8"><p className="text-xs font-black uppercase tracking-[.18em] text-black/40">Renter</p><h1 className="mt-2 text-4xl font-black tracking-[-.05em]">Your bookings</h1><p className="mt-3 text-black/55">Keep track of upcoming drives and past rentals.</p></div>
    <div className="space-y-5">{bookings.map(b => <article key={b.id} className="overflow-hidden rounded-3xl border border-black/8 bg-white md:flex"><img src={b.image} alt={b.car} className="h-52 w-full object-cover md:h-auto md:w-72"/><div className="flex-1 p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><span className="rounded-full bg-lime-100 px-3 py-1 text-xs font-black">{b.status}</span><h2 className="mt-4 text-xl font-black">{b.car}</h2><p className="mt-1 text-sm text-black/45">Booking {b.id}</p></div><div className="text-right"><p className="text-xs font-bold text-black/40">TOTAL</p><p className="text-2xl font-black">€{b.total}</p></div></div><div className="mt-6 grid gap-3 text-sm text-black/65 sm:grid-cols-3"><div className="flex gap-2"><CalendarDays size={17}/> {b.date}</div><div className="flex gap-2"><Clock3 size={17}/> {b.time}</div><div className="flex gap-2"><MapPin size={17}/> {b.location}</div></div></div></article>)}</div>
  </main>;
}
