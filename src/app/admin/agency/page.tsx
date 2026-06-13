import { requireAdminProfile } from "@/lib/data/session";
import { createClient } from "@/lib/supabase/server";
import { AgencyForm } from "@/components/admin/agency-form";

export const metadata = { title: "Agency Settings" };

export default async function AdminAgencyPage() {
  const { profile } = await requireAdminProfile();
  if (!profile.agency_id) {
    return <div className="rounded-xl border bg-card p-6">Your profile has no agency assigned. Ask the super admin.</div>;
  }
  const supabase = await createClient();
  const { data: agency } = await supabase.from("agencies").select("*").eq("id", profile.agency_id).maybeSingle();
  if (!agency) return <div className="rounded-xl border bg-card p-6">Agency not found.</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Agency settings</h1>
        <p className="text-sm text-muted-foreground">Edit the details customers see on your website.</p>
      </div>
      <AgencyForm agency={agency} />
    </div>
  );
}
