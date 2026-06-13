import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Car as CarIcon, Fuel, ImageIcon, Snowflake, Settings, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CarDetailEnquiry } from "@/components/site/car-detail-enquiry";
import { getAgencyOrNotFound, getCarById } from "@/lib/data/agency";
import { formatINR } from "@/lib/utils";

export default async function CarDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const agency = await getAgencyOrNotFound();
  const car = await getCarById(agency.id, id);
  if (!car) notFound();

  const cover = car.primary_image ?? car.images[0] ?? null;
  const gallery = car.images.length > 0 ? car.images : cover ? [cover] : [];

  return (
    <div className="container py-8 lg:py-12">
      <Link href="/cars" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to fleet
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border bg-muted">
            {cover ? (
              <Image src={cover} alt={car.model} fill priority sizes="(max-width: 1024px) 100vw, 60vw" className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground"><ImageIcon className="h-12 w-12" /></div>
            )}
          </div>
          {gallery.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {gallery.slice(0, 8).map((src, i) => (
                <div key={src + i} className="relative aspect-square overflow-hidden rounded-md border">
                  <Image src={src} alt={`${car.model} ${i + 1}`} fill sizes="120px" className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="flex items-center gap-2">
            <Badge variant="info"><CarIcon className="mr-1 h-3 w-3" /> {car.category}</Badge>
            {car.transmission && <Badge variant="outline">{car.transmission}</Badge>}
            {car.fuel_type && <Badge variant="outline">{car.fuel_type}</Badge>}
          </div>
          <h1 className="mt-3 font-display text-3xl font-bold">{car.model}</h1>

          <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl border bg-card p-4 text-sm">
            <div className="flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground" /> {car.seats} seats</div>
            {car.luggage != null && <div className="flex items-center gap-2"><Settings className="h-4 w-4 text-muted-foreground" /> {car.luggage} bags</div>}
            {car.ac && <div className="flex items-center gap-2"><Snowflake className="h-4 w-4 text-muted-foreground" /> AC</div>}
            {car.fuel_type && <div className="flex items-center gap-2"><Fuel className="h-4 w-4 text-muted-foreground" /> {car.fuel_type}</div>}
          </div>

          <div className="mt-4 rounded-xl border bg-card p-4">
            <h3 className="text-sm font-semibold">Pricing</h3>
            <dl className="mt-2 grid grid-cols-2 gap-3 text-sm">
              {car.local_rate_per_km != null && (
                <div><dt className="text-muted-foreground">Local</dt><dd className="font-semibold">{formatINR(car.local_rate_per_km)}/km</dd></div>
              )}
              {car.intercity_rate_per_km != null && (
                <div><dt className="text-muted-foreground">Intercity</dt><dd className="font-semibold">{formatINR(car.intercity_rate_per_km)}/km</dd></div>
              )}
              {car.airport_flat_rate != null && (
                <div><dt className="text-muted-foreground">Airport flat</dt><dd className="font-semibold">{formatINR(car.airport_flat_rate)}</dd></div>
              )}
              {car.package_total != null && car.package_km && (
                <div><dt className="text-muted-foreground">Package ({car.package_km} km)</dt><dd className="font-semibold">{formatINR(car.package_total)}</dd></div>
              )}
              {car.min_km_per_day != null && (
                <div><dt className="text-muted-foreground">Min km / day</dt><dd className="font-semibold">{car.min_km_per_day} km</dd></div>
              )}
              {car.driver_charge_per_day != null && (
                <div><dt className="text-muted-foreground">Driver / day</dt><dd className="font-semibold">{formatINR(car.driver_charge_per_day)}</dd></div>
              )}
            </dl>
          </div>

          {car.features && car.features.length > 0 && (
            <div className="mt-4 rounded-xl border bg-card p-4">
              <h3 className="text-sm font-semibold">Features</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {car.features.map((f) => <Badge key={f} variant="secondary">{f}</Badge>)}
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-2">
            <CarDetailEnquiry car={car} />
            {agency.phone && (
              <Button asChild variant="outline">
                <a href={`tel:${agency.phone.replace(/\s+/g, "")}`}>Call us</a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
