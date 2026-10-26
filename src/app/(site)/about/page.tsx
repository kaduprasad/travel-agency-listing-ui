import { AGENCY } from "@/lib/data/site-data";

export const metadata = { title: "About" };

export default function AboutPage() {
  const agency = AGENCY;
  return (
    <div className="container py-12 lg:py-16 max-w-3xl">
      <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">About</p>
      <h1 className="mt-2 font-display text-4xl font-bold">About {agency.name}</h1>
      <p className="mt-4 text-lg text-muted-foreground">{agency.description}</p>

      <div className="mt-10 rounded-xl border bg-card p-6">
        <h2 className="font-display text-xl font-semibold">Travel, made straightforward</h2>
        <p className="mt-2 text-muted-foreground">
          Choose a vehicle for local trips, intercity travel, airport transfers, or a holiday package. Review the listed rates and contact Skyline Travels directly to confirm availability and final fare details.
        </p>
      </div>
    </div>
  );
}
