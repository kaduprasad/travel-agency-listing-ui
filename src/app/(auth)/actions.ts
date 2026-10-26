"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { DATABASE_ENABLED } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

/** Normalize a mobile number or email into a Supabase-compatible email.
 *  Phone numbers (digits, spaces, dashes, +) → 91XXXXXXXXXX@skyline-travels.admin
 *  Emails are passed through unchanged. */
function toEmail(identifier: string): string {
  const digits = identifier.replace(/[\s\-().+]/g, "");
  if (/^\d{10}$/.test(digits)) return `91${digits}@skyline-travels.admin`;
  if (/^91\d{10}$/.test(digits)) return `${digits}@skyline-travels.admin`;
  return identifier.trim();
}

const loginSchema = z.object({
  identifier: z.string().min(6, "Enter your mobile number or email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  redirectTo: z.string().optional(),
});

export type LoginState = { ok: boolean; error?: string } | null;

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!DATABASE_ENABLED) return { ok: false, error: "Admin login is not enabled on this site." };
  const parsed = loginSchema.safeParse({
    identifier: formData.get("identifier"),
    password: formData.get("password"),
    redirectTo: formData.get("redirectTo")?.toString() || undefined,
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const email = toEmail(parsed.data.identifier);

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password: parsed.data.password });
  if (error) return { ok: false, error: "Invalid credentials. Check your number/email and password." };

  redirect(parsed.data.redirectTo && parsed.data.redirectTo.startsWith("/admin") ? parsed.data.redirectTo : "/admin");
}

export async function logoutAction() {
  if (!DATABASE_ENABLED) redirect("/");
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
