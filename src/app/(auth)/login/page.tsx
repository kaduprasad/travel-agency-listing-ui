import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "./login-form";
import { ArrowLeft } from "lucide-react";
import { SITE_NAME } from "@/lib/constants";

export const metadata = { title: "Admin Sign In" };

export default function LoginPage() {
  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden bg-gradient-to-br from-slate-950 via-brand-900 to-slate-950">
      <div className="absolute inset-0 bg-grid opacity-30" aria-hidden />
      <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl" aria-hidden />
      <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-brand-700/20 blur-3xl" aria-hidden />

      <div className="relative w-full max-w-md">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-white/70 transition hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to site
        </Link>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-2xl">
          <div className="mb-6 text-center">
            <h1 className="font-display text-2xl font-bold text-white">{SITE_NAME} Admin</h1>
            <p className="mt-1 text-sm text-white/60">Sign in to manage your bookings and fleet</p>
          </div>
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
          <p className="mt-6 text-center text-xs text-white/50">
            Access is restricted to authorized staff only.
          </p>
        </div>
      </div>
    </div>
  );
}
