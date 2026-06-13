"use client";
import dynamic from "next/dynamic";
import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Phone, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const Hero3D = dynamic(() => import("./hero-3d"), { ssr: false, loading: () => null });

interface HeroProps {
  agencyName: string;
  tagline: string | null;
  phone: string | null;
}

export function Hero({ agencyName, tagline, phone }: HeroProps) {
  const [render3D, setRender3D] = React.useState(false);

  React.useEffect(() => {
    // Skip 3D on small screens / reduced-motion / slow connections
    const motionOk = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const widthOk = window.innerWidth >= 768;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    const connOk = !conn || (!conn.saveData && conn.effectiveType !== "slow-2g" && conn.effectiveType !== "2g");
    if (motionOk && widthOk && connOk) setRender3D(true);
  }, []);

  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-slate-950 via-brand-900 to-slate-950 text-white">
      <div className="absolute inset-0 bg-grid opacity-25" aria-hidden />
      <div className="absolute -top-32 -right-32 h-[28rem] w-[28rem] rounded-full bg-brand-500/30 blur-3xl" aria-hidden />
      <div className="absolute -bottom-40 -left-32 h-[26rem] w-[26rem] rounded-full bg-brand-700/30 blur-3xl" aria-hidden />

      <div className="relative">
        {render3D && (
          <div className="absolute inset-0" aria-hidden>
            <Hero3D />
          </div>
        )}

        <div className="container relative grid gap-12 py-20 lg:grid-cols-2 lg:gap-8 lg:py-28">
          <div className="relative z-10 max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium backdrop-blur"
            >
              <Sparkles className="h-3.5 w-3.5 text-brand-200" /> Premium car rentals · Pune & beyond
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="mt-5 font-display text-4xl font-bold leading-tight text-balance sm:text-5xl lg:text-6xl"
            >
              Comfortable rides,{" "}
              <span className="bg-gradient-to-r from-brand-200 via-white to-brand-300 bg-clip-text text-transparent">
                transparent pricing
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mt-5 text-lg text-white/75"
            >
              {tagline ?? `Book ${agencyName} for local, intercity, airport pickup, and holiday packages with per-km clarity and clean, well-maintained vehicles.`}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Button asChild size="lg" variant="gradient">
                <Link href="/cars">
                  Explore our fleet <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              {phone && (
                <Button asChild size="lg" variant="outline" className="border-white/30 bg-white/5 text-white hover:bg-white/10 hover:text-white">
                  <a href={`tel:${phone.replace(/\s+/g, "")}`}>
                    <Phone className="h-4 w-4" /> {phone}
                  </a>
                </Button>
              )}
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/70"
            >
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-brand-200" /> Verified drivers</div>
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-brand-200" /> 24×7 support</div>
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-brand-200" /> No hidden charges</div>
            </motion.div>
          </div>

          {/* Right side reserved for the 3D scene on lg+ */}
          <div className="hidden lg:block" />
        </div>
      </div>
    </section>
  );
}
