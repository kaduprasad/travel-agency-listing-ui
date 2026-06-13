import { NextResponse, type NextRequest } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { enquirySchema } from "@/lib/validation/enquiry";
import { getAgencyBySlug } from "@/lib/data/agency";
import { DEFAULT_AGENCY_SLUG } from "@/lib/constants";
import { sendPushToAgency } from "@/lib/push/send";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 }); }

  const parsed = enquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const agency = await getAgencyBySlug(DEFAULT_AGENCY_SLUG);
  if (!agency) return NextResponse.json({ ok: false, error: "Agency not found" }, { status: 404 });

  // Use the anon client; RLS allows public insert into enquiries
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("enquiries")
    .insert({
      agency_id: agency.id,
      car_id: parsed.data.car_id ?? null,
      car_model_snapshot: parsed.data.car_model_snapshot ?? null,
      travel_type: parsed.data.travel_type,
      full_name: parsed.data.full_name,
      phone: parsed.data.phone,
      email: parsed.data.email,
      source_city: parsed.data.source_city ?? null,
      destination_city: parsed.data.destination_city ?? null,
      start_date: parsed.data.start_date || null,
      end_date: parsed.data.end_date || null,
      start_time: parsed.data.start_time || null,
      end_time: parsed.data.end_time || null,
      message: parsed.data.message ?? null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[enquiries POST] insert failed", error);
    return NextResponse.json({ ok: false, error: "Could not save enquiry" }, { status: 500 });
  }

  // Best-effort push notification to all admins of this agency.
  // Uses service role so it works without requiring the public user to be authenticated.
  try {
    const service = createServiceRoleClient();
    await sendPushToAgency(service, agency.id, {
      title: `New enquiry · ${parsed.data.travel_type}`,
      body: `${parsed.data.full_name} · ${parsed.data.phone}${parsed.data.car_model_snapshot ? " · " + parsed.data.car_model_snapshot : ""}`,
      url: "/admin/enquiries",
      tag: `enquiry-${data.id}`,
    });
  } catch (e) {
    console.error("[enquiries POST] push failed", e);
  }

  return NextResponse.json({ ok: true, id: data.id });
}
