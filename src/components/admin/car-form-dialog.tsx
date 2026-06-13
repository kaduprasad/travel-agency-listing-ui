"use client";
import * as React from "react";
import { useFormStatus } from "react-dom";
import { useActionState } from "react";
import Image from "next/image";
import { Loader2, Save, UploadCloud, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import { upsertCarAction, type CarFormState } from "@/app/admin/cars/actions";
import type { Car } from "@/lib/database.types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  car: Car | null;
  onSaved: () => void;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="gradient" disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
      {pending ? "Saving…" : "Save car"}
    </Button>
  );
}

export function CarFormDialog({ open, onOpenChange, car, onSaved }: Props) {
  const { toast } = useToast();
  const [images, setImages] = React.useState<string[]>([]);
  const [primary, setPrimary] = React.useState<string>("");
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) {
      setImages(car?.images ?? []);
      setPrimary(car?.primary_image ?? car?.images?.[0] ?? "");
    }
  }, [open, car]);

  const [state, formAction] = useActionState<CarFormState, FormData>(async (_p, fd) => {
    fd.set("images", images.join(","));
    fd.set("primary_image", primary || (images[0] ?? ""));
    const res = await upsertCarAction(_p, fd);
    if (res?.ok) {
      toast({ variant: "success", title: car ? "Car updated" : "Car added" });
      onSaved();
    } else if (res?.error) {
      toast({ variant: "destructive", title: "Save failed", description: res.error });
    }
    return res;
  }, null);

  async function onPickFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const supabase = createClient();
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;
        if (file.size > 5 * 1024 * 1024) {
          toast({ variant: "destructive", title: "Image too large", description: `${file.name} exceeds 5 MB.` });
          continue;
        }
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `${crypto.randomUUID()}.${ext.toLowerCase()}`;
        const { error: upErr } = await supabase.storage.from("car-images").upload(path, file, { cacheControl: "31536000", upsert: false });
        if (upErr) {
          toast({ variant: "destructive", title: "Upload failed", description: upErr.message });
          continue;
        }
        const { data: pub } = supabase.storage.from("car-images").getPublicUrl(path);
        uploaded.push(pub.publicUrl);
      }
      if (uploaded.length > 0) {
        setImages((cur) => {
          const next = [...cur, ...uploaded].slice(0, 12);
          if (!primary && next[0]) setPrimary(next[0]);
          return next;
        });
        toast({ variant: "success", title: `Uploaded ${uploaded.length} image${uploaded.length > 1 ? "s" : ""}` });
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function removeImage(url: string) {
    setImages((cur) => cur.filter((u) => u !== url));
    if (primary === url) setPrimary(images.find((u) => u !== url) ?? "");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{car ? "Edit car" : "Add a new car"}</DialogTitle>
          <DialogDescription>Customers will see these details on the website.</DialogDescription>
        </DialogHeader>

        <form action={formAction} className="grid gap-5">
          {car && <input type="hidden" name="id" value={car.id} />}

          {/* Basic info */}
          <section className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5 sm:col-span-2">
              <Label htmlFor="model">Model *</Label>
              <Input id="model" name="model" required defaultValue={car?.model ?? ""} placeholder="e.g. Toyota Innova Crysta" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="category">Category *</Label>
              <Input id="category" name="category" required defaultValue={car?.category ?? ""} placeholder="Sedan / SUV / TT" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="seats">Seats *</Label>
              <Input id="seats" name="seats" type="number" min={1} required defaultValue={car?.seats ?? 4} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="luggage">Luggage bags</Label>
              <Input id="luggage" name="luggage" type="number" min={0} defaultValue={car?.luggage ?? ""} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="fuel_type">Fuel</Label>
              <Input id="fuel_type" name="fuel_type" defaultValue={car?.fuel_type ?? ""} placeholder="Petrol / Diesel / EV" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="transmission">Transmission</Label>
              <Select name="transmission" defaultValue={car?.transmission ?? ""}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="automatic">Automatic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label className="flex items-center gap-2">
                <input type="checkbox" name="ac" defaultChecked={car?.ac ?? true} className="h-4 w-4 rounded border-input" />
                AC available
              </Label>
              <Label className="flex items-center gap-2">
                <input type="checkbox" name="is_active" defaultChecked={car?.is_active ?? true} className="h-4 w-4 rounded border-input" />
                Show on website
              </Label>
            </div>
          </section>

          {/* Pricing */}
          <section className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5"><Label htmlFor="local_rate_per_km">Local ₹/km</Label>
              <Input id="local_rate_per_km" name="local_rate_per_km" type="number" step="0.5" min={0} defaultValue={car?.local_rate_per_km ?? ""} /></div>
            <div className="grid gap-1.5"><Label htmlFor="intercity_rate_per_km">Intercity ₹/km</Label>
              <Input id="intercity_rate_per_km" name="intercity_rate_per_km" type="number" step="0.5" min={0} defaultValue={car?.intercity_rate_per_km ?? ""} /></div>
            <div className="grid gap-1.5"><Label htmlFor="airport_flat_rate">Airport flat ₹</Label>
              <Input id="airport_flat_rate" name="airport_flat_rate" type="number" step="1" min={0} defaultValue={car?.airport_flat_rate ?? ""} /></div>
            <div className="grid gap-1.5"><Label htmlFor="min_km_per_day">Min km/day</Label>
              <Input id="min_km_per_day" name="min_km_per_day" type="number" min={0} defaultValue={car?.min_km_per_day ?? ""} /></div>
            <div className="grid gap-1.5"><Label htmlFor="package_km">Package km</Label>
              <Input id="package_km" name="package_km" type="number" min={0} defaultValue={car?.package_km ?? ""} /></div>
            <div className="grid gap-1.5"><Label htmlFor="package_total">Package total ₹</Label>
              <Input id="package_total" name="package_total" type="number" step="1" min={0} defaultValue={car?.package_total ?? ""} /></div>
            <div className="grid gap-1.5"><Label htmlFor="driver_charge_per_day">Driver ₹/day</Label>
              <Input id="driver_charge_per_day" name="driver_charge_per_day" type="number" step="1" min={0} defaultValue={car?.driver_charge_per_day ?? ""} /></div>
            <div className="grid gap-1.5"><Label htmlFor="sort_order">Display order</Label>
              <Input id="sort_order" name="sort_order" type="number" min={0} defaultValue={car?.sort_order ?? 0} /></div>
          </section>

          <div className="grid gap-1.5">
            <Label htmlFor="features">Features (comma-separated)</Label>
            <Textarea id="features" name="features" rows={2}
              defaultValue={(car?.features ?? []).join(", ")}
              placeholder="Music System, Charging Port, Bluetooth" />
          </div>

          {/* Images */}
          <div className="space-y-2">
            <Label>Photos</Label>
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading || images.length >= 12}>
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                {uploading ? "Uploading…" : "Upload images"}
              </Button>
              <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={(e) => onPickFiles(e.target.files)} />
              <span className="text-xs text-muted-foreground">PNG/JPG/WebP, ≤5MB each, up to 12</span>
            </div>
            {images.length > 0 ? (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {images.map((url) => (
                  <div key={url} className={`group relative overflow-hidden rounded-md border ${primary === url ? "ring-2 ring-brand-500" : ""}`}>
                    <div className="relative aspect-square">
                      <Image src={url} alt="" fill sizes="180px" className="object-cover" />
                    </div>
                    <div className="absolute inset-0 flex items-end justify-between gap-1 bg-gradient-to-t from-black/70 to-transparent p-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button type="button" className="rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold text-foreground"
                        onClick={() => setPrimary(url)}>{primary === url ? "Primary" : "Set primary"}</button>
                      <button type="button" className="rounded bg-red-600 p-1 text-white" onClick={() => removeImage(url)} aria-label="Remove">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center rounded-md border border-dashed py-6 text-xs text-muted-foreground">
                No photos yet — upload at least one for a great first impression.
              </div>
            )}
          </div>

          {state?.error && <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}

          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <SubmitButton />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
