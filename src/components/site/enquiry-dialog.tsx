"use client";
import * as React from "react";
import { Loader2, Send } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import type { Car } from "@/lib/database.types";
import { enquirySchema } from "@/lib/validation/enquiry";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  car?: Car | null;
  defaultTravelType?: TravelType;
}

export function EnquiryDialog({ open, onOpenChange, car = null, defaultTravelType = "local" }: Props) {
  const { toast } = useToast();
  const [travelType, setTravelType] = React.useState<TravelType>(defaultTravelType);
  const [submitting, setSubmitting] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    if (open) setTravelType(defaultTravelType);
  }, [open, defaultTravelType]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = {
      car_id: car?.id ?? null,
      car_model_snapshot: car?.model ?? null,
      travel_type: travelType,
      full_name: String(formData.get("full_name") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      email: String(formData.get("email") ?? ""),
      source_city: String(formData.get("source_city") ?? ""),
      destination_city: String(formData.get("destination_city") ?? ""),
      start_date: String(formData.get("start_date") ?? ""),
      end_date: String(formData.get("end_date") ?? ""),
      start_time: String(formData.get("start_time") ?? ""),
      end_time: String(formData.get("end_time") ?? ""),
      message: String(formData.get("message") ?? ""),
    };

    const parsed = enquirySchema.safeParse(payload);
    if (!parsed.success) {
      toast({ variant: "destructive", title: "Please review your details", description: parsed.error.issues[0]?.message });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Could not send enquiry");
      toast({
        variant: "success",
        title: "Enquiry sent!",
        description: "We'll get back to you on the number provided.",
      });
      formRef.current?.reset();
      onOpenChange(false);
    } catch (err) {
      toast({ variant: "destructive", title: "Failed to send", description: err instanceof Error ? err.message : "Try again" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Send an enquiry{car ? ` · ${car.model}` : ""}</DialogTitle>
          <DialogDescription>
            Fill in the details and we&apos;ll respond via call or message.
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
            <Field id="full_name" label="Full Name *" required placeholder="Your name" />
            <Field id="phone" label="Contact Number *" required type="tel" placeholder="+91 98765 43210" inputMode="tel" />
          </div>
          <Field id="email" label="Email (optional)" type="email" placeholder="you@example.com" />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="source_city" label="Pickup city" placeholder="From" required={travelType !== "package"} />
            <Field id="destination_city" label="Drop city" placeholder="To" required={travelType !== "local"} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="start_date" label="Start date" type="date" />
            <Field id="start_time" label="Start time" type="time" />
          </div>

          {(travelType === "intercity" || travelType === "package") && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="end_date" label="Return date" type="date" />
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
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
            <Button type="submit" variant="gradient" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {submitting ? "Sending…" : "Send Enquiry"}
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
