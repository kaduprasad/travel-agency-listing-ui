import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import type { Agency } from "@/lib/database.types";

export function SiteFooter({ agency }: { agency: Agency }) {
  const address = agency.address as { line1?: string; line2?: string; city?: string; state?: string; zip?: string } | null;
  return (
    <footer className="border-t bg-muted/30">
      <div className="container grid gap-10 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md">ST</span>
            <span className="gradient-text">{agency.name}</span>
          </Link>
          <p className="mt-3 max-w-md text-sm text-muted-foreground">{agency.description}</p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Explore</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/" className="hover:text-foreground">Home</Link></li>
            <li><Link href="/cars" className="hover:text-foreground">Our Fleet</Link></li>
            <li><Link href="/about" className="hover:text-foreground">About</Link></li>
            <li><Link href="/contact" className="hover:text-foreground">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Get in touch</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {agency.phone && (
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <a href={`tel:${agency.phone.replace(/\s+/g, "")}`} className="hover:text-foreground">{agency.phone}</a>
              </li>
            )}
            {agency.email && (
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                <a href={`mailto:${agency.email}`} className="hover:text-foreground">{agency.email}</a>
              </li>
            )}
            {address && (
              <li className="flex gap-2">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  {[address.line1, address.line2, address.city, address.state, address.zip].filter(Boolean).join(", ")}
                </span>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t">
        <div className="container flex flex-col gap-2 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {agency.name}. All rights reserved.</p>
          <p>
            Built with Next.js · Powered by Supabase ·{" "}
            <Link href="/login" className="underline-offset-2 hover:underline">Admin</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
