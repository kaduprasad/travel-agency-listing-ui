import Link from "next/link";
import { ArrowUpRight, MessageSquare, PhoneCall, TrendingUp, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EnquiriesChart } from "@/components/admin/enquiries-chart";
import { requireAdminProfile } from "@/lib/data/session";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { Enquiry } from "@/lib/database.types";

export const metadata = { title: "Dashboard" };

export default async function AdminDashboardPage() {
  const { profile } = await requireAdminProfile();
  const supabase = await createClient();
  const agencyId = profile.agency_id;
  if (!agencyId) {
    return (
      <div className="rounded-xl border bg-card p-6">
        Your account isn&apos;t linked to any agency. Ask the super admin to assign one.
      </div>
    );
  }

  // Enquiries — last 12 months for chart + counts
  const since = new Date();
  since.setMonth(since.getMonth() - 11);
  since.setDate(1);
  since.setHours(0, 0, 0, 0);

  const { data: yearEnquiries } = await supabase
    .from("enquiries")
    .select("id, created_at, status, travel_type, full_name, phone, car_model_snapshot")
    .eq("agency_id", agencyId)
    .gte("created_at", since.toISOString());

  const all: Pick<Enquiry, "id" | "created_at" | "status" | "travel_type" | "full_name" | "phone" | "car_model_snapshot">[] =
    yearEnquiries ?? [];

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const monthEnd = monthStart;
  const last7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const thisMonth = all.filter((e) => new Date(e.created_at) >= monthStart).length;
  const lastMonth = all.filter((e) => {
    const d = new Date(e.created_at);
    return d >= lastMonthStart && d < monthEnd;
  }).length;
  const last7Days = all.filter((e) => new Date(e.created_at) >= last7).length;
  const open = all.filter((e) => e.status === "new").length;

  const delta = lastMonth === 0 ? (thisMonth > 0 ? 100 : 0) : Math.round(((thisMonth - lastMonth) / lastMonth) * 100);

  // Build month buckets (12 months)
  const buckets: { label: string; count: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const count = all.filter((e) => {
      const c = new Date(e.created_at);
      return c >= d && c < next;
    }).length;
    buckets.push({ label: d.toLocaleString("en", { month: "short" }), count });
  }

  const recent = [...all].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at)).slice(0, 8);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome back, {profile.full_name ?? "Admin"}.</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/enquiries">View all enquiries <ArrowUpRight className="h-4 w-4" /></Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="This month" value={thisMonth} icon={Calendar} delta={delta} />
        <StatCard label="Last 7 days" value={last7Days} icon={TrendingUp} />
        <StatCard label="Open (new)" value={open} icon={MessageSquare} highlight={open > 0} />
        <StatCard label="Last 12 months" value={all.length} icon={PhoneCall} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enquiries · last 12 months</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <EnquiriesChart data={buckets} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent enquiries</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/enquiries">See all <ArrowUpRight className="h-4 w-4" /></Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No enquiries yet.</p>
          ) : (
            <ul className="divide-y">
              {recent.map((e) => (
                <li key={e.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{e.full_name}</span>
                      <Badge variant={e.status === "new" ? "info" : "secondary"} className="capitalize">{e.status}</Badge>
                      <Badge variant="outline" className="capitalize">{e.travel_type}</Badge>
                    </div>
                    <div className="mt-1 truncate text-sm text-muted-foreground">
                      {e.car_model_snapshot ?? "—"} · {formatDate(e.created_at)}
                    </div>
                  </div>
                  <a href={`tel:${e.phone}`} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline">
                    <PhoneCall className="h-3.5 w-3.5" /> {e.phone}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  label, value, icon: Icon, delta, highlight,
}: { label: string; value: number; icon: React.ComponentType<{ className?: string }>; delta?: number; highlight?: boolean }) {
  return (
    <Card className={highlight ? "border-brand-300 bg-brand-50/50 dark:bg-brand-900/10" : undefined}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{label}</span>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="mt-2 flex items-end gap-2">
          <span className="font-display text-3xl font-bold">{value}</span>
          {delta != null && (
            <span className={`mb-1 text-xs font-medium ${delta >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {delta >= 0 ? "+" : ""}{delta}% vs prev
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
