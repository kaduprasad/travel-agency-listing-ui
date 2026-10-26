import { CarCard } from "@/components/site/car-card";
import { CARS } from "@/lib/data/site-data";

export const metadata = { title: "Our Fleet" };

export default function CarsPage() {
  return (
    <div className="container py-12 lg:py-16">
      <header className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">Our Fleet</p>
        <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">Choose the car that fits your trip</h1>
        <p className="mt-3 text-muted-foreground">Sedans, SUVs and tempo travellers — fully maintained, transparently priced.</p>
      </header>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {CARS.map((car, i) => <CarCard key={car.id} car={car} index={i} />)}
      </div>
    </div>
  );
}
