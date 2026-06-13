"use client";
import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PhoneCall, RefreshCw, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ENQUIRY_STATUSES, TRAVEL_TYPES, type EnquiryStatus } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { Enquiry } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { updateEnquiryAction, deleteEnquiryAction } from "@/app/admin/enquiries/actions";

interface Filters {
  status?: string;
  type?: string;
  q?: string;
}

function statusVariant(s: EnquiryStatus) {
  switch (s) {
    case "new": return "info" as const;
    case "contacted": return "warning" as const;
    case "confirmed": return "success" as const;
    case "closed": return "secondary" as const;
    case "cancelled": return "destructive" as const;
  }
}

export function EnquiriesTable({ initialRows, initialFilters }: { initialRows: Enquiry[]; initialFilters: Filters }) {
  const router = useRouter();
  const sp = useSearchParams();
  const { toast } = useToast();
  const [rows, setRows] = React.useState(initialRows);
  const [q, setQ] = React.useState(initialFilters.q ?? "");
  const [status, setStatus] = React.useState(initialFilters.status ?? "all");
  const [type, setType] = React.useState(initialFilters.type ?? "all");
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  React.useEffect(() => setRows(initialRows), [initialRows]);

  // Realtime subscription: refresh on inserts/updates.
  React.useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("enquiries-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "enquiries" }, () => {
        router.refresh();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [router]);

  function applyFilters(next: Filters) {
    const params = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(next)) {
      if (!v || v === "all") params.delete(k);
      else params.set(k, v);
    }
    router.push(`/admin/enquiries${params.toString() ? `?${params.toString()}` : ""}`);
  }

  function onSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    applyFilters({ q, status, type });
  }

  async function changeStatus(row: Enquiry, next: EnquiryStatus) {
    setPendingId(row.id);
    const fd = new FormData();
    fd.set("id", row.id);
    fd.set("status", next);
    fd.set("notes", row.notes ?? "");
    const res = await updateEnquiryAction(fd);
    setPendingId(null);
    if (!res.ok) toast({ variant: "destructive", title: "Update failed", description: res.error });
    else router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Delete this enquiry permanently?")) return;
    setPendingId(id);
    const res = await deleteEnquiryAction(id);
    setPendingId(null);
    if (!res.ok) toast({ variant: "destructive", title: "Delete failed", description: res.error });
    else router.refresh();
  }

  return (
    <div className="space-y-4">
      <form onSubmit={onSearchSubmit} className="flex flex-wrap items-end gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search name, phone, car…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="w-40">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              {ENQUIRY_STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="w-44">
          <Select value={type} onValueChange={setType}>
            <SelectTrigger><SelectValue placeholder="Travel type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {TRAVEL_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" variant="default"><Search className="h-4 w-4" /> Apply</Button>
        <Button type="button" variant="ghost" onClick={() => router.refresh()}><RefreshCw className="h-4 w-4" /> Refresh</Button>
      </form>

      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>When</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Trip</TableHead>
              <TableHead>Car</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-sm text-muted-foreground">No enquiries found.</TableCell>
              </TableRow>
            ) : rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{formatDate(r.created_at)}</TableCell>
                <TableCell>
                  <div className="font-medium">{r.full_name}</div>
                  {r.email && <div className="text-xs text-muted-foreground">{r.email}</div>}
                </TableCell>
                <TableCell>
                  <a href={`tel:${r.phone}`} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline">
                    <PhoneCall className="h-3.5 w-3.5" /> {r.phone}
                  </a>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">{r.travel_type}</Badge>
                  {(r.source_city || r.destination_city) && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      {[r.source_city, r.destination_city].filter(Boolean).join(" → ")}
                    </div>
                  )}
                </TableCell>
                <TableCell className="max-w-[180px] truncate">{r.car_model_snapshot ?? "—"}</TableCell>
                <TableCell>
                  <div className="w-36">
                    <Select value={r.status} onValueChange={(v) => changeStatus(r, v as EnquiryStatus)} disabled={pendingId === r.id}>
                      <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ENQUIRY_STATUSES.map((s) => (
                          <SelectItem key={s} value={s} className="capitalize">
                            <Badge variant={statusVariant(s)} className="capitalize">{s}</Badge>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button type="button" variant="ghost" size="icon" onClick={() => remove(r.id)} disabled={pendingId === r.id}>
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
