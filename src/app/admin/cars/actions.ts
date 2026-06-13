"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdminProfile } from "@/lib/data/session";

const carSchema = z.object({
  id: z.string().uuid().optional(),
  model: z.string().trim().min(2).max(160),
  category: z.string().trim().min(2).max(80),
  seats: z.coerce.number().int().min(1).max(60),
  luggage: z.coerce.number().int().min(0).max(40).optional().nullable(),
  ac: z.coerce.boolean(),
  transmission: z.enum(["manual", "automatic"]).optional().nullable(),
  fuel_type: z.string().trim().max(40).optional().nullable(),
  local_rate_per_km: z.coerce.number().min(0).max(10000).optional().nullable(),
  intercity_rate_per_km: z.coerce.number().min(0).max(10000).optional().nullable(),
  airport_flat_rate: z.coerce.number().min(0).max(1000000).optional().nullable(),
  package_km: z.coerce.number().int().min(0).max(100000).optional().nullable(),
  package_total: z.coerce.number().min(0).max(10000000).optional().nullable(),
  min_km_per_day: z.coerce.number().int().min(0).max(100000).optional().nullable(),
  driver_charge_per_day: z.coerce.number().min(0).max(1000000).optional().nullable(),
  features: z.array(z.string().min(1).max(60)).max(30).default([]),
  images: z.array(z.string().url()).max(12).default([]),
  primary_image: z.string().url().optional().nullable(),
  is_active: z.coerce.boolean(),
  sort_order: z.coerce.number().int().min(0).max(10000).default(0),
});

export type CarFormState = { ok: boolean; error?: string } | null;

function parseFormCar(formData: FormData) {
  const featuresRaw = String(formData.get("features") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const imagesRaw = String(formData.get("images") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return carSchema.safeParse({
    id: formData.get("id") || undefined,
    model: formData.get("model"),
    category: formData.get("category"),
    seats: formData.get("seats"),
    luggage: formData.get("luggage") || null,
    ac: formData.get("ac") === "on" || formData.get("ac") === "true",
    transmission: (formData.get("transmission") || null) as string | null,
    fuel_type: formData.get("fuel_type") || null,
    local_rate_per_km: formData.get("local_rate_per_km") || null,
    intercity_rate_per_km: formData.get("intercity_rate_per_km") || null,
    airport_flat_rate: formData.get("airport_flat_rate") || null,
    package_km: formData.get("package_km") || null,
    package_total: formData.get("package_total") || null,
    min_km_per_day: formData.get("min_km_per_day") || null,
    driver_charge_per_day: formData.get("driver_charge_per_day") || null,
    features: featuresRaw,
    images: imagesRaw,
    primary_image: formData.get("primary_image") || (imagesRaw[0] ?? null),
    is_active: formData.get("is_active") === "on" || formData.get("is_active") === "true",
    sort_order: formData.get("sort_order") || 0,
  });
}

export async function upsertCarAction(_prev: CarFormState, formData: FormData): Promise<CarFormState> {
  const { profile } = await requireAdminProfile();
  if (!profile.agency_id) return { ok: false, error: "Your profile has no agency assigned." };
  const parsed = parseFormCar(formData);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  const payload = { ...parsed.data, agency_id: profile.agency_id };
  delete (payload as Partial<typeof payload>).id;

  if (parsed.data.id) {
    let q = supabase.from("cars").update(payload).eq("id", parsed.data.id);
    if (profile.role !== "super_admin") q = q.eq("agency_id", profile.agency_id);
    const { error } = await q;
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await supabase.from("cars").insert(payload);
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath("/admin/cars");
  revalidatePath("/");
  revalidatePath("/cars");
  return { ok: true };
}

export async function deleteCarAction(id: string): Promise<CarFormState> {
  const { profile } = await requireAdminProfile();
  if (!z.string().uuid().safeParse(id).success) return { ok: false, error: "Invalid id" };
  const supabase = await createClient();
  let q = supabase.from("cars").delete();
  if (profile.role !== "super_admin" && profile.agency_id) q = q.eq("agency_id", profile.agency_id);
  const { error } = await q.eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/cars");
  revalidatePath("/");
  revalidatePath("/cars");
  return { ok: true };
}

export async function toggleCarActiveAction(id: string, isActive: boolean): Promise<CarFormState> {
  const { profile } = await requireAdminProfile();
  const supabase = await createClient();
  let q = supabase.from("cars").update({ is_active: isActive });
  if (profile.role !== "super_admin" && profile.agency_id) q = q.eq("agency_id", profile.agency_id);
  const { error } = await q.eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/cars");
  revalidatePath("/");
  revalidatePath("/cars");
  return { ok: true };
}
