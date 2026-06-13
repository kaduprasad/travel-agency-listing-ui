"use client";
import * as React from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { createAdminUserAction, deleteAdminUserAction, type UserFormState } from "@/app/admin/users/actions";
import type { Agency, Profile } from "@/lib/database.types";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="gradient" disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
      {pending ? "Creating…" : "Create user"}
    </Button>
  );
}

export function UsersManager({
  users, agencies,
}: { users: (Profile & { email: string | null })[]; agencies: Agency[] }) {
  const { toast } = useToast();
  const router = useRouter();
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  const [, formAction] = useActionState<UserFormState, FormData>(async (_p, fd) => {
    const res = await createAdminUserAction(_p, fd);
    if (res?.ok) { toast({ variant: "success", title: "User created" }); router.refresh(); }
    else if (res?.error) toast({ variant: "destructive", title: "Could not create", description: res.error });
    return res;
  }, null);

  async function remove(id: string) {
    if (!confirm("Delete this user permanently?")) return;
    setPendingId(id);
    const res = await deleteAdminUserAction(id);
    setPendingId(null);
    if (!res?.ok) toast({ variant: "destructive", title: "Delete failed", description: res?.error });
    else router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader className="flex flex-row items-center gap-2">
          <UserPlus className="h-4 w-4" />
          <CardTitle>New admin user</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="grid gap-3">
            <div className="grid gap-1.5"><Label htmlFor="full_name">Full name</Label>
              <Input id="full_name" name="full_name" required /></div>
            <div className="grid gap-1.5"><Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required /></div>
            <div className="grid gap-1.5"><Label htmlFor="password">Temporary password</Label>
              <Input id="password" name="password" type="text" minLength={8} required /></div>
            <div className="grid gap-1.5"><Label htmlFor="role">Role</Label>
              <Select name="role" defaultValue="agency_admin">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="agency_admin">Agency admin</SelectItem>
                  <SelectItem value="super_admin">Super admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5"><Label htmlFor="agency_id">Agency</Label>
              <Select name="agency_id" defaultValue={agencies[0]?.id ?? ""}>
                <SelectTrigger><SelectValue placeholder="Select agency" /></SelectTrigger>
                <SelectContent>
                  {agencies.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <SubmitButton />
          </form>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader><CardTitle>All admin users</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Agency</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="py-8 text-center text-muted-foreground">No users yet.</TableCell></TableRow>
                ) : users.map((u) => {
                  const agency = agencies.find((a) => a.id === u.agency_id);
                  return (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.full_name ?? "—"}</TableCell>
                      <TableCell>{u.email ?? "—"}</TableCell>
                      <TableCell><Badge variant={u.role === "super_admin" ? "info" : "secondary"}>{u.role === "super_admin" ? "Super" : "Agency"}</Badge></TableCell>
                      <TableCell>{agency?.name ?? "—"}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => remove(u.id)} disabled={pendingId === u.id}>
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
