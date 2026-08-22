import { ArrowLeft, CarFront, Check, ChevronDown, MapPin, SlidersHorizontal, Star } from "lucide-react";
import Link from "next/link";
import { cars } from "@/lib/cars";

const filters = ["All cars", "Automatic", "Electric", "Hybrid", "Under €10/h"];

export default function CarsPage() {
  return (
    <main className="min-h-screen">
      <header className="border-b border-black/8 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-8">
          <Link href="/" className="text-2xl font-black tracking-[-0.06em]">kerreore<span className="text-lime-500">.</span></Link>
          <Link href="/" className="flex items-center gap-2 text-sm font-bold"><ArrowLeft size={16}/> Home</Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-12">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div><div className="mb-3 flex items-center gap-2 text-sm font-bold text-black/50"><MapPin size={16}/> Pristina, Kosovo</div><h1 className="text-4xl font-black tracking-[-0.05em] md:text-5xl">Cars available now</h1><p className="mt-3 max-w-xl text-black/50">Choose a car, pick your hours, and get moving. All prices are shown per hour.</p></div>
          <button className="flex w-fit items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-bold"><SlidersHorizontal size={17}/> Filters</button>
        </div>

        <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
          {filters.map((filter, index) => <button key={filter} className={`whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-bold ${index === 0 ? "bg-black text-white" : "border border-black/10 bg-white"}`}>{index === 0 && <Check size={14} className="mr-1.5 inline"/>}{filter}</button>)}
        </div>

        <div className="mt-8 flex items-center justify-between border-y border-black/8 py-4 text-sm"><span className="font-bold">{cars.length} cars</span><button className="flex items-center gap-2 font-bold text-black/60">Recommended <ChevronDown size={15}/></button></div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cars.map((car) => <Link href={`/cars/${car.id}`} key={car.id} className="group overflow-hidden rounded-3xl border border-black/8 bg-white transition hover:-translate-y-1 hover:shadow-xl">
            <div className="relative aspect-[4/3] overflow-hidden bg-[#e8e8e2]"><img src={car.image} alt={car.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105"/><span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-black">Available</span><span className="absolute right-4 top-4 rounded-full bg-black/75 px-3 py-1.5 text-xs font-black text-white">€{car.price}/h</span></div>
            <div className="p-5"><div className="flex justify-between gap-3"><div><h2 className="font-black">{car.name}</h2><p className="mt-1 text-sm text-black/50">{car.year} · {car.transmission} · {car.seats} seats</p></div><div className="flex items-center gap-1 text-sm font-bold"><Star size={14} fill="currentColor"/> {car.rating}</div></div><div className="mt-5 flex items-center justify-between border-t border-black/8 pt-4"><span className="flex items-center gap-1.5 text-sm text-black/50"><MapPin size={14}/> {car.location}</span><span className="text-sm font-black">View car →</span></div></div>
          </Link>)}
        </div>
      </section>
    </main>
  );
}
