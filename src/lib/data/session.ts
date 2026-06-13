import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/database.types";

export async function getSessionProfile(): Promise<{
  user: { id: string; email: string | undefined } | null;
  profile: Profile | null;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, profile: null };

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return { user: { id: user.id, email: user.email }, profile };
}

export async function requireAdminProfile(): Promise<{
  user: { id: string; email: string | undefined };
  profile: Profile;
}> {
  const { user, profile } = await getSessionProfile();
  if (!user || !profile) throw new Error("Not authenticated");
  return { user, profile };
}
