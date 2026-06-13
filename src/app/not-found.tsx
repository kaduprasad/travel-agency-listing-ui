import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-brand-600">404</p>
      <h1 className="mt-3 font-display text-4xl font-bold">Page not found</h1>
      <p className="mt-2 max-w-md text-muted-foreground">The page you’re looking for doesn’t exist or has been moved.</p>
      <Button asChild className="mt-6" variant="gradient">
        <Link href="/"><ArrowLeft className="h-4 w-4" /> Back home</Link>
      </Button>
    </div>
  );
}
