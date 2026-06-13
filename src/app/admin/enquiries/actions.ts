"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdminProfile } from "@/lib/data/session";
import { ENQUIRY_STATUSES, type EnquiryStatus } from "@/lib/constants";

const updateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(ENQUIRY_STATUSES),
  notes: z.string().max(2000).optional().nullable(),
});

export async function updateEnquiryAction(formData: FormData) {
  const { profile } = await requireAdminProfile();
  const parsed = updateSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
    notes: formData.get("notes")?.toString() || null,
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  let q = supabase.from("enquiries").update({ status: parsed.data.status, notes: parsed.data.notes });
  if (profile.role !== "super_admin" && profile.agency_id) q = q.eq("agency_id", profile.agency_id);
  const { error } = await q.eq("id", parsed.data.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin");
  revalidatePath("/admin/enquiries");
  return { ok: true };
}

export async function deleteEnquiryAction(id: string) {
  const { profile } = await requireAdminProfile();
  if (!z.string().uuid().safeParse(id).success) return { ok: false, error: "Invalid id" };
  const supabase = await createClient();
  let q = supabase.from("enquiries").delete();
  if (profile.role !== "super_admin" && profile.agency_id) q = q.eq("agency_id", profile.agency_id);
  const { error } = await q.eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin");
  revalidatePath("/admin/enquiries");
  return { ok: true };
}

export type { EnquiryStatus };
