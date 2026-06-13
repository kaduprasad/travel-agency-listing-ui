import { redirect } from "next/navigation";
import { requireAdminProfile } from "@/lib/data/session";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { UsersManager } from "@/components/admin/users-manager";
import type { Agency, Profile } from "@/lib/database.types";

export const metadata = { title: "Users" };

export default async function AdminUsersPage() {
  const { profile } = await requireAdminProfile();
  if (profile.role !== "super_admin") redirect("/admin");

  const admin = createServiceRoleClient();
  const [{ data: profiles }, { data: agencies }, { data: usersList }] = await Promise.all([
    admin.from("profiles").select("*").order("created_at", { ascending: false }),
    admin.from("agencies").select("*").order("name"),
    admin.auth.admin.listUsers({ perPage: 200 }),
  ]);

  const emailById = new Map<string, string>();
  for (const u of usersList?.users ?? []) if (u.email) emailById.set(u.id, u.email);

  const rows = (profiles ?? []).map((p) => ({ ...p, email: emailById.get(p.id) ?? null }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Users</h1>
        <p className="text-sm text-muted-foreground">Create admin accounts and assign agencies. Super-admin only.</p>
      </div>
      <UsersManager users={rows as (Profile & { email: string | null })[]} agencies={(agencies ?? []) as Agency[]} />
    </div>
  );
}
