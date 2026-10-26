import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DATABASE_ENABLED } from "@/lib/constants";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  if (!DATABASE_ENABLED) return NextResponse.json({ ok: false, error: "Database features are disabled." }, { status: 503 });
  // Reject requests that don't carry the Vercel cron secret.
  // CRON_SECRET is set as an env var in the Vercel dashboard.
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = await createClient();
    // Lightweight query — just proves the DB is alive
    const { error } = await supabase.from("agencies").select("id").limit(1);
    if (error) throw error;
    return NextResponse.json({ ok: true, ts: new Date().toISOString() });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
