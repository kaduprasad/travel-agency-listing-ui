import { NextResponse, type NextRequest } from "next/server";
import { DATABASE_ENABLED } from "@/lib/constants";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  if (!DATABASE_ENABLED) return NextResponse.next();
  return updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons/|sw.js|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
