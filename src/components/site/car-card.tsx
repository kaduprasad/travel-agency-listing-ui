"use client";
import * as React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Car as CarIcon, ChevronLeft, ChevronRight, Fuel, Users, Snowflake, Settings, ImageIcon } from "lucide-react";
import type { Car } from "@/lib/data/site-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/utils";
import { EnquiryDialog } from "@/components/site/enquiry-dialog";

interface CarCardProps {
  car: Car;
  index?: number;
}

function ImageGallery({ images, model }: { images: string[]; model: string }) {
  const [idx, setIdx] = React.useState(0);
  const total = images.length;

  // Auto-advance every 3 s when multiple images
  React.useEffect(() => {
    if (total <= 1) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % total), 3000);
    return () => clearInterval(id);
  }, [total]);

  if (total === 0) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <ImageIcon className="h-10 w-10" />
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {images.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt={`${model} photo ${i + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={`object-cover transition-opacity duration-700 ${i === idx ? "opacity-100" : "opacity-0"}`}
          priority={i === 0}
        />
      ))}

      {total > 1 && (
        <>
          <button
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-1 text-white hover:bg-black/70"
            onClick={(e) => { e.stopPropagation(); setIdx((i) => (i - 1 + total) % total); }}
            aria-label="Previous image"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-1 text-white hover:bg-black/70"
            onClick={(e) => { e.stopPropagation(); setIdx((i) => (i + 1) % total); }}
            aria-label="Next image"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setIdx(i); }}
                aria-label={`Go to image ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${i === idx ? "w-4 bg-white" : "w-1.5 bg-white/50"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function CarCard({ car, index = 0 }: CarCardProps) {
  const [enquiryOpen, setEnquiryOpen] = React.useState(false);
  const images = car.images?.length ? car.images : car.primary_image ? [car.primary_image] : [];

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.4, delay: Math.min(index, 4) * 0.05 }}
        className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-lg"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          <ImageGallery images={images} model={car.model} />
          <div className="absolute left-3 top-3 z-10 flex gap-2">
            <Badge variant="info" className="shadow">
              <CarIcon className="mr-1 h-3 w-3" /> {car.category}
            </Badge>
            {images.length > 1 && (
              <Badge variant="secondary" className="shadow">{images.length} photos</Badge>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h3 className="font-display text-lg font-semibold leading-tight">{car.model}</h3>

          <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5"><Users className="h-4 w-4" /> {car.seats} seats</div>
            {car.transmission && <div className="flex items-center gap-1.5"><Settings className="h-4 w-4" /> {car.transmission}</div>}
            {car.fuel_type && <div className="flex items-center gap-1.5"><Fuel className="h-4 w-4" /> {car.fuel_type}</div>}
            {car.ac && <div className="flex items-center gap-1.5"><Snowflake className="h-4 w-4" /> AC</div>}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg bg-muted/40 p-3 text-xs">
            {car.local_rate_per_km != null && (
              <div>
                <div className="text-muted-foreground">Local</div>
                <div className="font-semibold text-foreground">{formatINR(car.local_rate_per_km)}/km</div>
              </div>
            )}
            {car.intercity_rate_per_km != null && (
              <div>
                <div className="text-muted-foreground">Intercity</div>
                <div className="font-semibold text-foreground">{formatINR(car.intercity_rate_per_km)}/km</div>
              </div>
            )}
            {car.airport_flat_rate != null && (
              <div>
                <div className="text-muted-foreground">Airport flat</div>
                <div className="font-semibold text-foreground">{formatINR(car.airport_flat_rate)}</div>
              </div>
            )}
            {car.package_total != null && car.package_km && (
              <div>
                <div className="text-muted-foreground">Package · {car.package_km}km</div>
                <div className="font-semibold text-foreground">{formatINR(car.package_total)}</div>
              </div>
            )}
          </div>

          <div className="mt-5 flex items-center justify-between gap-2">
            <Button asChild variant="ghost" size="sm">
              <a href={`/cars/${car.id}`}>View details</a>
            </Button>
            <Button variant="gradient" size="sm" onClick={() => setEnquiryOpen(true)}>
              Enquire
            </Button>
          </div>
        </div>
      </motion.article>

      <EnquiryDialog
        open={enquiryOpen}
        onOpenChange={setEnquiryOpen}
        car={car}
      />
    </>
  );
}
