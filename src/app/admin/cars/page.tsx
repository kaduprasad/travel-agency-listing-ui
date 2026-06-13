import { requireAdminProfile } from "@/lib/data/session";
import { createClient } from "@/lib/supabase/server";
import { CarsManager } from "@/components/admin/cars-manager";
import type { Car } from "@/lib/database.types";

export const metadata = { title: "Fleet" };

export default async function AdminCarsPage() {
  const { profile } = await requireAdminProfile();
  if (!profile.agency_id) {
    return <div className="rounded-xl border bg-card p-6">Your profile has no agency assigned. Ask the super admin.</div>;
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from("cars")
    .select("*")
    .eq("agency_id", profile.agency_id)
    .order("sort_order", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Fleet</h1>
        <p className="text-sm text-muted-foreground">Add, edit and showcase the cars your customers can book.</p>
      </div>
      <CarsManager initialCars={(data ?? []) as Car[]} />
    </div>
  );
}
