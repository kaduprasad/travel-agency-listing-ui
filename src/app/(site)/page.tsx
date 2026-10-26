import Link from "next/link";
import { ArrowRight, BadgeCheck, Clock4, MapPin, Phone, Plane, Gift, Route, Sparkles } from "lucide-react";
import { Hero } from "@/components/site/hero";
import { CarCard } from "@/components/site/car-card";
import { Button } from "@/components/ui/button";
import { AGENCY, CARS } from "@/lib/data/site-data";

const SERVICES = [
  { icon: MapPin, title: "Local Trips", description: "Within-city hourly or per-km bookings for errands, events, weddings." },
  { icon: Route, title: "Outstation", description: "Round-trip and one-way intercity travel with experienced drivers." },
  { icon: Plane, title: "Airport / Railway", description: "Reliable pickup & drop service with flat transparent fares." },
  { icon: Gift, title: "Tour Packages", description: "Curated holiday packages with fixed all-inclusive pricing." },
];

const WHY = [
  { icon: BadgeCheck, title: "Verified Drivers", description: "Background-checked, courteous, route-aware professionals." },
  { icon: Clock4, title: "Always On Time", description: "Strict pickup punctuality with live coordination on every trip." },
  { icon: Sparkles, title: "Clean Vehicles", description: "Regularly serviced, sanitised and ready for your journey." },
];

export default function HomePage() {
  const agency = AGENCY;
  const featured = CARS.slice(0, 4);

  return (
    <>
      <Hero agencyName={agency.name} tagline={agency.tagline} phone={agency.phone} />

      {/* Services */}
      <section className="container py-16 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">What we offer</p>
          <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">Every trip, covered</h2>
          <p className="mt-3 text-muted-foreground">Pick the service that fits your plan — all backed by transparent pricing and live support.</p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map(({ icon: Icon, title, description }) => (
            <div key={title} className="group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured fleet */}
      <section className="bg-muted/30 py-16 lg:py-24">
        <div className="container">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">Featured fleet</p>
              <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">Pick your ride</h2>
              <p className="mt-2 max-w-xl text-muted-foreground">Sedans for city runs, SUVs for family trips, and tempo travellers for groups.</p>
            </div>
            <Button asChild variant="outline">
              <Link href="/cars">View entire fleet <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((car, i) => <CarCard key={car.id} car={car} index={i} />)}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="container py-16 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">Why {agency.name}</p>
            <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">Reliability you can feel — from booking to drop-off</h2>
            <p className="mt-3 text-muted-foreground">We&apos;ve built our reputation one trip at a time. Here&apos;s what you can expect on every booking.</p>
            <div className="mt-6 space-y-4">
              {WHY.map(({ icon: Icon, title, description }) => (
                <div key={title} className="flex gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  <div>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 p-8 text-white shadow-xl lg:p-10">
            <h3 className="font-display text-2xl font-bold">Plan your next ride</h3>
            <p className="mt-2 text-white/85">Drop us a call or send an enquiry. We typically respond within a few minutes.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              {agency.phone && (
                <Button asChild size="lg" className="bg-white text-brand-700 hover:bg-white/90">
                  <a href={`tel:${agency.phone.replace(/\s+/g, "")}`}><Phone className="h-4 w-4" /> {agency.phone}</a>
                </Button>
              )}
              <Button asChild size="lg" variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white">
                <Link href="/cars">Browse cars <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
