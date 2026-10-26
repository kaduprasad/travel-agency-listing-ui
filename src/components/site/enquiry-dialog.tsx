"use client";
import * as React from "react";
import { MessageCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TRAVEL_TYPES, type TravelType } from "@/lib/constants";
import { MAHARASHTRA_CITIES } from "@/lib/maharashtra-cities";
import { AGENCY, type Car } from "@/lib/data/site-data";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  car?: Car | null;
  defaultTravelType?: TravelType;
}

export function EnquiryDialog({ open, onOpenChange, car = null, defaultTravelType = "local" }: Props) {
  const [travelType, setTravelType] = React.useState<TravelType>(defaultTravelType);
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    if (open) setTravelType(defaultTravelType);
  }, [open, defaultTravelType]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const fields = {
      name: formData.get("full_name"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      from: formData.get("source_city"),
      to: formData.get("destination_city"),
      startDate: formData.get("start_date"),
      endDate: formData.get("end_date"),
      startTime: formData.get("start_time"),
      endTime: formData.get("end_time"),
      message: formData.get("message"),
    };
    const details = [
      `Trip type: ${travelType}`,
      `Vehicle: ${car?.model ?? "Not selected"}`,
      `Name: ${fields.name}`,
      `Mobile: ${fields.phone}`,
      fields.email ? `Email: ${fields.email}` : "",
      fields.from ? `From: ${fields.from}` : "",
      fields.to ? `To: ${fields.to}` : "",
      fields.startDate ? `Start date: ${fields.startDate}` : "",
      fields.endDate ? `Return date: ${fields.endDate}` : "",
      fields.startTime ? `Start time: ${fields.startTime}` : "",
      fields.endTime ? `Return time: ${fields.endTime}` : "",
      fields.message ? `Message: ${fields.message}` : "",
    ].filter(Boolean);
    const whatsappUrl = `https://wa.me/${AGENCY.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Skyline Travels enquiry\n${details.join("\n")}`)}`;
    const whatsappWindow = window.open(whatsappUrl, "_blank");
    if (whatsappWindow) whatsappWindow.opener = null;
    else window.location.assign(whatsappUrl);
    formRef.current?.reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Send an enquiry{car ? ` · ${car.model}` : ""}</DialogTitle>
          <DialogDescription>
            Add your trip details. WhatsApp will open with your enquiry ready to send.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={travelType} onValueChange={(v) => setTravelType(v as TravelType)}>
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            {TRAVEL_TYPES.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <form ref={formRef} onSubmit={onSubmit} className="mt-4 grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="full_name" label="Full Name" required placeholder="Your name" />
            <Field id="phone" label="Contact Number" required type="tel" placeholder="+91 98765 43210" inputMode="tel" />
          </div>
          <Field id="email" label="Email (optional)" type="email" placeholder="you@example.com" />

          <div className="grid gap-4 sm:grid-cols-2">
            {travelType === "local" ? (
              <>
                <Field id="source_city" label="Pickup Address" placeholder="From" required />
                <Field id="destination_city" label="Drop Address" placeholder="To" />
              </>
            ) : (
              <>
                <CityField id="source_city" label="Pickup City" required={travelType !== "package"} />
                <CityField id="destination_city" label="Drop City" required={travelType === "intercity"} />
              </>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <DateField id="start_date" label="Start date" />
            <Field id="start_time" label="Start time" type="time" />
          </div>

          {(travelType === "intercity" || travelType === "package") && (
            <div className="grid gap-4 sm:grid-cols-2">
              <DateField id="end_date" label="Return date" />
              <Field id="end_time" label="Return time" type="time" />
            </div>
          )}

          <div className="grid gap-1.5">
            <Label htmlFor="message">Additional message</Label>
            <Textarea
              id="message"
              name="message"
              rows={3}
              defaultValue={car ? `Hi, I'd like to book the ${car.model} for a ${travelType} trip.` : ""}
              maxLength={1000}
            />
          </div>

          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" variant="gradient">
              <MessageCircle className="h-4 w-4" />
              Continue to WhatsApp
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  id,
  label,
  required,
  type = "text",
  placeholder,
  inputMode,
}: {
  id: string;
  label: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={id} type={type} required={required} placeholder={placeholder} inputMode={inputMode} />
    </div>
  );
}

function DateField({ id, label }: { id: string; label: string }) {
  const [display, setDisplay] = React.useState("");
  const hiddenRef = React.useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    let v = e.target.value.replace(/\D/g, "");
    if (v.length > 8) v = v.slice(0, 8);
    // Auto-insert slashes: dd/mm/yyyy
    if (v.length > 4) v = v.slice(0, 2) + "/" + v.slice(2, 4) + "/" + v.slice(4);
    else if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2);
    setDisplay(v);

    // Convert to yyyy-mm-dd for backend
    const parts = v.split("/");
    if (parts.length === 3 && parts[2]?.length === 4) {
      const iso = `${parts[2]}-${parts[1]}-${parts[0]}`;
      if (hiddenRef.current) hiddenRef.current.value = iso;
    } else {
      if (hiddenRef.current) hiddenRef.current.value = "";
    }
  }

  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={`${id}_display`}
        placeholder="dd/mm/yyyy"
        value={display}
        onChange={handleChange}
        inputMode="numeric"
        maxLength={10}
      />
      <input ref={hiddenRef} type="hidden" name={id} />
    </div>
  );
}

function CityField({ id, label, required }: { id: string; label: string; required?: boolean }) {
  const [value, setValue] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const filtered = value
    ? MAHARASHTRA_CITIES.filter((c) => c.toLowerCase().includes(value.toLowerCase()))
    : MAHARASHTRA_CITIES;

  return (
    <div className="relative grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={id}
        placeholder="Type or select city"
        required={required}
        value={value}
        autoComplete="off"
        onChange={(e) => { setValue(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && filtered.length > 0 && (
        <ul className="absolute top-full z-50 mt-1 max-h-44 w-full overflow-y-auto rounded-md border bg-popover p-1 shadow-md">
          {filtered.map((city) => (
            <li
              key={city}
              className="cursor-pointer rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
              onMouseDown={() => { setValue(city); setOpen(false); }}
            >
              {city}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
