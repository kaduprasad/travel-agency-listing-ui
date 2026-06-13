"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireAdminProfile } from "@/lib/data/session";

const createSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  full_name: z.string().trim().min(2).max(120),
  role: z.enum(["agency_admin", "super_admin"]),
  agency_id: z.string().uuid().optional().nullable(),
});

export type UserFormState = { ok: boolean; error?: string } | null;

export async function createAdminUserAction(_prev: UserFormState, formData: FormData): Promise<UserFormState> {
  const { profile } = await requireAdminProfile();
  if (profile.role !== "super_admin") return { ok: false, error: "Only super admins can create users." };

  const parsed = createSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    full_name: formData.get("full_name"),
    role: formData.get("role"),
    agency_id: formData.get("agency_id") || null,
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const admin = createServiceRoleClient();
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: { full_name: parsed.data.full_name, role: parsed.data.role },
  });
  if (createErr || !created.user) return { ok: false, error: createErr?.message ?? "Could not create user" };

  // Profile is auto-created by trigger; ensure role/agency are correct
  const { error: upErr } = await admin
    .from("profiles")
    .upsert({
      id: created.user.id,
      role: parsed.data.role,
      agency_id: parsed.data.agency_id ?? profile.agency_id ?? null,
      full_name: parsed.data.full_name,
    });
  if (upErr) return { ok: false, error: upErr.message };

  revalidatePath("/admin/users");
  return { ok: true };
}

export async function deleteAdminUserAction(userId: string): Promise<UserFormState> {
  const { profile, user } = await requireAdminProfile();
  if (profile.role !== "super_admin") return { ok: false, error: "Only super admins can delete users." };
  if (userId === user.id) return { ok: false, error: "You cannot delete your own account." };
  if (!z.string().uuid().safeParse(userId).success) return { ok: false, error: "Invalid id" };
  const admin = createServiceRoleClient();
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/users");
  return { ok: true };
}
