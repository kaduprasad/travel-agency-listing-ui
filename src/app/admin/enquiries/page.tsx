import { requireAdminProfile } from "@/lib/data/session";
import { createClient } from "@/lib/supabase/server";
import { EnquiriesTable } from "@/components/admin/enquiries-table";
import { ENQUIRY_STATUSES, TRAVEL_TYPES, type EnquiryStatus } from "@/lib/constants";
import type { Enquiry } from "@/lib/database.types";

export const metadata = { title: "Enquiries" };

interface SearchParams {
  status?: string;
  type?: string;
  q?: string;
}

const STATUS_SET = new Set<EnquiryStatus>(ENQUIRY_STATUSES);
const TYPE_SET = new Set(TRAVEL_TYPES.map((t) => t.value));

export default async function AdminEnquiriesPage({
  searchParams,
}: { searchParams: Promise<SearchParams> }) {
  const { profile } = await requireAdminProfile();
  const supabase = await createClient();
  const sp = await searchParams;

  let query = supabase
    .from("enquiries")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (profile.role !== "super_admin" && profile.agency_id) {
    query = query.eq("agency_id", profile.agency_id);
  }
  if (sp.status && sp.status !== "all" && STATUS_SET.has(sp.status as EnquiryStatus)) {
    query = query.eq("status", sp.status as EnquiryStatus);
  }
  if (sp.type && sp.type !== "all" && TYPE_SET.has(sp.type as typeof TRAVEL_TYPES[number]["value"])) {
    query = query.eq("travel_type", sp.type as typeof TRAVEL_TYPES[number]["value"]);
  }
  if (sp.q) query = query.or(`full_name.ilike.%${sp.q}%,phone.ilike.%${sp.q}%,car_model_snapshot.ilike.%${sp.q}%`);

  const { data } = await query;
  const rows: Enquiry[] = data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Enquiries</h1>
        <p className="text-sm text-muted-foreground">All booking enquiries from your website.</p>
      </div>
      <EnquiriesTable initialRows={rows} initialFilters={sp} />
    </div>
  );
}
