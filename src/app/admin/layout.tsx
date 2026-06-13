import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { getSessionProfile } from "@/lib/data/session";
import { getAgencyBySlug } from "@/lib/data/agency";

export const metadata = { title: "Admin" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await getSessionProfile();
  if (!user || !profile) redirect("/login");

  // Resolve agency for header context.
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  let agency = null;
  if (profile.agency_id) {
    const { data } = await supabase.from("agencies").select("*").eq("id", profile.agency_id).maybeSingle();
    agency = data;
  } else {
    agency = await getAgencyBySlug();
  }

  return (
    <AdminShell user={{ email: user.email ?? "" }} profile={profile} agency={agency}>
      {children}
    </AdminShell>
  );
}
