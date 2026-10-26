import { Mail, MapPin, Phone } from "lucide-react";
import { AGENCY } from "@/lib/data/site-data";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  const agency = AGENCY;
  const fullAddress = [agency.address.line1, agency.address.line2, agency.address.city, agency.address.state, agency.address.zip].filter(Boolean).join(", ");

  return (
    <div className="container py-12 lg:py-16 max-w-3xl">
      <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">Contact</p>
      <h1 className="mt-2 font-display text-4xl font-bold">Get in touch</h1>
      <p className="mt-3 text-muted-foreground">We typically reply within a few minutes during business hours.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {agency.phone && (
          <a href={`tel:${agency.phone.replace(/\s+/g, "")}`} className="rounded-xl border bg-card p-5 transition hover:shadow-md">
            <Phone className="h-5 w-5 text-brand-600" />
            <div className="mt-3 text-xs uppercase text-muted-foreground">Phone</div>
            <div className="mt-1 font-semibold">{agency.phone}</div>
          </a>
        )}
        {agency.email && (
          <a href={`mailto:${agency.email}`} className="rounded-xl border bg-card p-5 transition hover:shadow-md">
            <Mail className="h-5 w-5 text-brand-600" />
            <div className="mt-3 text-xs uppercase text-muted-foreground">Email</div>
            <div className="mt-1 font-semibold break-all">{agency.email}</div>
          </a>
        )}
        <div className="rounded-xl border bg-card p-5">
          <MapPin className="h-5 w-5 text-brand-600" />
          <div className="mt-3 text-xs uppercase text-muted-foreground">Address</div>
          <div className="mt-1 text-sm">{fullAddress}</div>
        </div>
      </div>
    </div>
  );
}
