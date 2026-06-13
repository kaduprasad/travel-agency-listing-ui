"use client";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { updateAgencyAction, type AgencyFormState } from "@/app/admin/agency/actions";
import type { Agency } from "@/lib/database.types";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="gradient" disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
      {pending ? "Saving…" : "Save changes"}
    </Button>
  );
}

export function AgencyForm({ agency }: { agency: Agency }) {
  const { toast } = useToast();
  const addr = (agency.address as { line1?: string; line2?: string; city?: string; state?: string; zip?: string } | null) ?? {};

  const [state, formAction] = useActionState<AgencyFormState, FormData>(async (_p, fd) => {
    const res = await updateAgencyAction(_p, fd);
    if (res?.ok) toast({ variant: "success", title: "Agency updated" });
    else if (res?.error) toast({ variant: "destructive", title: "Save failed", description: res.error });
    return res;
  }, null);

  return (
    <form action={formAction} className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Brand</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5 sm:col-span-2"><Label htmlFor="name">Agency name *</Label>
            <Input id="name" name="name" required defaultValue={agency.name} /></div>
          <div className="grid gap-1.5 sm:col-span-2"><Label htmlFor="tagline">Tagline</Label>
            <Input id="tagline" name="tagline" defaultValue={agency.tagline ?? ""} /></div>
          <div className="grid gap-1.5 sm:col-span-2"><Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" rows={4} defaultValue={agency.description ?? ""} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Contact</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="grid gap-1.5"><Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" defaultValue={agency.phone ?? ""} /></div>
          <div className="grid gap-1.5"><Label htmlFor="whatsapp">WhatsApp (optional)</Label>
            <Input id="whatsapp" name="whatsapp" defaultValue={agency.whatsapp ?? ""} /></div>
          <div className="grid gap-1.5"><Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" defaultValue={agency.email ?? ""} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Address</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5 sm:col-span-2"><Label htmlFor="line1">Address line 1</Label>
            <Input id="line1" name="line1" defaultValue={addr.line1 ?? ""} /></div>
          <div className="grid gap-1.5 sm:col-span-2"><Label htmlFor="line2">Address line 2</Label>
            <Input id="line2" name="line2" defaultValue={addr.line2 ?? ""} /></div>
          <div className="grid gap-1.5"><Label htmlFor="city">City</Label>
            <Input id="city" name="city" defaultValue={addr.city ?? ""} /></div>
          <div className="grid gap-1.5"><Label htmlFor="state">State</Label>
            <Input id="state" name="state" defaultValue={addr.state ?? ""} /></div>
          <div className="grid gap-1.5"><Label htmlFor="zip">Pincode</Label>
            <Input id="zip" name="zip" defaultValue={addr.zip ?? ""} /></div>
        </CardContent>
      </Card>

      {state?.error && <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      <div className="flex justify-end"><SubmitButton /></div>
    </form>
  );
}
