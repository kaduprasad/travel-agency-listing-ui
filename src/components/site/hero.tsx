"use client";
import dynamic from "next/dynamic";
import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Phone, ShieldCheck, Clock4, Sparkles, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const Hero3D = dynamic(() => import("./hero-3d"), { ssr: false, loading: () => null });

interface HeroProps {
  agencyName: string;
  tagline: string | null;
  phone: string | null;
}

export function Hero({ agencyName, tagline, phone }: HeroProps) {
  return (
    <section className="relative isolate overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0">
        <Hero3D />
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/50 to-slate-950/90" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" aria-hidden />

      <div className="container relative z-10 flex min-h-[88vh] flex-col items-center justify-center py-24 text-center lg:min-h-[92vh] lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-wider backdrop-blur"
        >
          <Sparkles className="h-3.5 w-3.5 text-brand-200" /> Premium car rentals
          <span className="hidden h-3 w-px bg-white/30 sm:inline-block" />
          <span className="hidden items-center gap-1 sm:inline-flex">
            <MapPin className="h-3.5 w-3.5 text-brand-200" /> Pune &amp; beyond
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="mt-6 font-display text-5xl font-extrabold leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl xl:text-[8.5rem]"
        >
          <span className="block bg-gradient-to-b from-white via-white to-brand-300 bg-clip-text text-transparent drop-shadow-[0_2px_30px_rgba(58,125,255,0.25)]">
            {agencyName}
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 max-w-2xl text-balance text-lg text-white/85 sm:text-xl"
        >
          {tagline ?? "Comfortable rides, transparent pricing — for every journey."}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <Button asChild size="lg" variant="gradient" className="text-base shadow-lg shadow-brand-500/30">
            <Link href="/cars">
              Explore our fleet <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          {phone && (
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/30 bg-white/5 text-base text-white backdrop-blur hover:bg-white/15 hover:text-white"
            >
              <a href={`tel:${phone.replace(/\s+/g, "")}`}>
                <Phone className="h-4 w-4" /> {phone}
              </a>
            </Button>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-white/75"
        >
          <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-brand-200" /> Verified drivers</div>
          <div className="flex items-center gap-2"><Clock4 className="h-4 w-4 text-brand-200" /> 24×7 support</div>
          <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-brand-200" /> No hidden charges</div>
        </motion.div>
      </div>
    </section>
  );
}

