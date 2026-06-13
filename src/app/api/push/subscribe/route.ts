import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const schema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
  user_agent: z.string().optional().nullable(),
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("agency_id").eq("id", user.id).maybeSingle();
  if (!profile?.agency_id) return NextResponse.json({ ok: false, error: "No agency for profile" }, { status: 400 });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid subscription" }, { status: 400 });

  const { error } = await supabase
    .from("push_subscriptions")
    .upsert(
      {
        profile_id: user.id,
        agency_id: profile.agency_id,
        endpoint: parsed.data.endpoint,
        p256dh: parsed.data.keys.p256dh,
        auth: parsed.data.keys.auth,
        user_agent: parsed.data.user_agent ?? null,
      },
      { onConflict: "endpoint" }
    );
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get("endpoint");
  if (!endpoint) return NextResponse.json({ ok: false, error: "Endpoint required" }, { status: 400 });

  await supabase.from("push_subscriptions").delete().eq("profile_id", user.id).eq("endpoint", endpoint);
  return NextResponse.json({ ok: true });
}
