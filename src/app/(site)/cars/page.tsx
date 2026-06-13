import { CarCard } from "@/components/site/car-card";
import { getAgencyOrNotFound, getAgencyCars } from "@/lib/data/agency";

export const metadata = { title: "Our Fleet" };

export default async function CarsPage() {
  const agency = await getAgencyOrNotFound();
  const cars = await getAgencyCars(agency.id);

  return (
    <div className="container py-12 lg:py-16">
      <header className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">Our Fleet</p>
        <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">Choose the car that fits your trip</h1>
        <p className="mt-3 text-muted-foreground">Sedans, SUVs and tempo travellers — fully maintained, transparently priced.</p>
      </header>

      {cars.length === 0 ? (
        <div className="mt-12 rounded-xl border border-dashed bg-card p-10 text-center text-muted-foreground">
          No cars listed yet. The admin can add cars from the dashboard.
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {cars.map((car, i) => <CarCard key={car.id} car={car} index={i} />)}
        </div>
      )}
    </div>
  );
}
