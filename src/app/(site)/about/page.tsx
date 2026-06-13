import { getAgencyOrNotFound } from "@/lib/data/agency";

export const metadata = { title: "About" };

export default async function AboutPage() {
  const agency = await getAgencyOrNotFound();
  return (
    <div className="container py-12 lg:py-16 max-w-3xl">
      <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">About</p>
      <h1 className="mt-2 font-display text-4xl font-bold">About {agency.name}</h1>
      <p className="mt-4 text-lg text-muted-foreground">{agency.description}</p>

      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        {[
          { k: "10+", v: "Years of experience" },
          { k: "5,000+", v: "Trips completed" },
          { k: "4.8★", v: "Average rating" },
        ].map(({ k, v }) => (
          <div key={k} className="rounded-xl border bg-card p-6 text-center">
            <div className="font-display text-3xl font-bold text-brand-700">{k}</div>
            <div className="mt-1 text-sm text-muted-foreground">{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
