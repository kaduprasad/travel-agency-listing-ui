"use client";
import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Edit3, ImageIcon, Plus, Power, PowerOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CarFormDialog } from "@/components/admin/car-form-dialog";
import { deleteCarAction, toggleCarActiveAction } from "@/app/admin/cars/actions";
import { formatINR } from "@/lib/utils";
import type { Car } from "@/lib/database.types";

export function CarsManager({ initialCars }: { initialCars: Car[] }) {
  const [editing, setEditing] = React.useState<Car | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  async function onDelete(car: Car) {
    if (!confirm(`Delete "${car.model}"? This cannot be undone.`)) return;
    setPendingId(car.id);
    const res = await deleteCarAction(car.id);
    setPendingId(null);
    if (!res?.ok) toast({ variant: "destructive", title: "Delete failed", description: res?.error });
    else { toast({ variant: "success", title: "Car deleted" }); router.refresh(); }
  }

  async function onToggle(car: Car) {
    setPendingId(car.id);
    const res = await toggleCarActiveAction(car.id, !car.is_active);
    setPendingId(null);
    if (!res?.ok) toast({ variant: "destructive", title: "Update failed", description: res?.error });
    else router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button variant="gradient" onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" /> Add car
        </Button>
      </div>

      {initialCars.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-card p-10 text-center text-sm text-muted-foreground">
          No cars yet. Click <span className="font-semibold">“Add car”</span> to add your first vehicle.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {initialCars.map((car) => {
            const cover = car.primary_image ?? car.images[0] ?? null;
            return (
              <div key={car.id} className="overflow-hidden rounded-xl border bg-card shadow-sm">
                <div className="relative aspect-[16/10] bg-muted">
                  {cover ? (
                    <Image src={cover} alt={car.model} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground"><ImageIcon className="h-10 w-10" /></div>
                  )}
                  <div className="absolute left-2 top-2 flex gap-1">
                    <Badge variant={car.is_active ? "success" : "secondary"}>{car.is_active ? "Live" : "Hidden"}</Badge>
                    <Badge variant="info">{car.category}</Badge>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold">{car.model}</h3>
                    <span className="text-xs text-muted-foreground">#{car.sort_order}</span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <div>Seats: <span className="text-foreground">{car.seats}</span></div>
                    {car.transmission && <div>Trans: <span className="text-foreground capitalize">{car.transmission}</span></div>}
                    {car.local_rate_per_km != null && <div>Local: <span className="text-foreground">{formatINR(car.local_rate_per_km)}/km</span></div>}
                    {car.intercity_rate_per_km != null && <div>Intercity: <span className="text-foreground">{formatINR(car.intercity_rate_per_km)}/km</span></div>}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEditing(car)} disabled={pendingId === car.id}>
                      <Edit3 className="h-4 w-4" /> Edit
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => onToggle(car)} disabled={pendingId === car.id}>
                      {car.is_active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                      {car.is_active ? "Hide" : "Publish"}
                    </Button>
                    <Button size="sm" variant="ghost" className="ml-auto text-red-600 hover:text-red-700" onClick={() => onDelete(car)} disabled={pendingId === car.id}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CarFormDialog
        open={creating || !!editing}
        onOpenChange={(o) => { if (!o) { setCreating(false); setEditing(null); } }}
        car={editing}
        onSaved={() => { setCreating(false); setEditing(null); router.refresh(); }}
      />
    </div>
  );
}
