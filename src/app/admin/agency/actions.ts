"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdminProfile } from "@/lib/data/session";

const schema = z.object({
  name: z.string().trim().min(2).max(160),
  tagline: z.string().trim().max(200).optional().nullable(),
  description: z.string().trim().max(2000).optional().nullable(),
  phone: z.string().trim().max(40).optional().nullable(),
  email: z.string().trim().email().max(160).optional().or(z.literal("")).transform((v) => v || null),
  whatsapp: z.string().trim().max(40).optional().nullable(),
  line1: z.string().trim().max(160).optional().nullable(),
  line2: z.string().trim().max(160).optional().nullable(),
  city: z.string().trim().max(80).optional().nullable(),
  state: z.string().trim().max(80).optional().nullable(),
  zip: z.string().trim().max(20).optional().nullable(),
});

export type AgencyFormState = { ok: boolean; error?: string } | null;

export async function updateAgencyAction(_prev: AgencyFormState, formData: FormData): Promise<AgencyFormState> {
  const { profile } = await requireAdminProfile();
  if (!profile.agency_id) return { ok: false, error: "No agency assigned" };

  const parsed = schema.safeParse({
    name: formData.get("name"),
    tagline: formData.get("tagline") || null,
    description: formData.get("description") || null,
    phone: formData.get("phone") || null,
    email: formData.get("email") || "",
    whatsapp: formData.get("whatsapp") || null,
    line1: formData.get("line1") || null,
    line2: formData.get("line2") || null,
    city: formData.get("city") || null,
    state: formData.get("state") || null,
    zip: formData.get("zip") || null,
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("agencies")
    .update({
      name: parsed.data.name,
      tagline: parsed.data.tagline,
      description: parsed.data.description,
      phone: parsed.data.phone,
      email: parsed.data.email,
      whatsapp: parsed.data.whatsapp,
      address: {
        line1: parsed.data.line1,
        line2: parsed.data.line2,
        city: parsed.data.city,
        state: parsed.data.state,
        zip: parsed.data.zip,
      },
    })
    .eq("id", profile.agency_id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/agency");
  return { ok: true };
}
