"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Car, LayoutDashboard, LogOut, Menu, MessageSquare, ShieldCheck, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EnableNotificationsButton } from "@/components/admin/enable-notifications-button";
import { logoutAction } from "@/app/(auth)/actions";
import type { Agency, Profile } from "@/lib/database.types";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/enquiries", label: "Enquiries", icon: MessageSquare },
  { href: "/admin/cars", label: "Fleet", icon: Car },
  { href: "/admin/agency", label: "Agency", icon: Building2 },
  { href: "/admin/users", label: "Users", icon: ShieldCheck, superOnly: true },
];

export function AdminShell({
  children,
  user,
  profile,
  agency,
}: {
  children: React.ReactNode;
  user: { email: string };
  profile: Profile;
  agency: Agency | null;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const items = NAV.filter((i) => !i.superOnly || profile.role === "super_admin");

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar (desktop) */}
      <aside className="hidden w-64 shrink-0 border-r bg-background lg:flex lg:flex-col">
        <SidebarContent items={items} pathname={pathname} agency={agency} profile={profile} user={user} />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25 }}
              className="relative h-full w-72 bg-background shadow-xl"
            >
              <button className="absolute right-3 top-3 rounded-md p-2 hover:bg-muted" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
              <SidebarContent items={items} pathname={pathname} agency={agency} profile={profile} user={user} onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b bg-background/80 px-4 backdrop-blur lg:h-16 lg:px-6">
          <button className="rounded-md p-2 hover:bg-muted lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1 truncate text-sm font-semibold text-muted-foreground">
            {agency ? agency.name : "Admin"}
          </div>
          <EnableNotificationsButton />
        </header>
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}

function SidebarContent({
  items, pathname, agency, profile, user, onNavigate,
}: {
  items: typeof NAV;
  pathname: string;
  agency: Agency | null;
  profile: Profile;
  user: { email: string };
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-bold text-white">
          {agency?.name?.[0] ?? "S"}
        </span>
        <div className="min-w-0">
          <div className="truncate font-display font-semibold">{agency?.name ?? "Admin"}</div>
          <div className="text-xs text-muted-foreground">Admin Console</div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {items.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-3">
        <div className="rounded-md bg-muted/60 p-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
              {(profile.full_name ?? user.email)[0]?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{profile.full_name ?? user.email}</div>
              <Badge variant={profile.role === "super_admin" ? "info" : "secondary"} className="mt-0.5">
                {profile.role === "super_admin" ? "Super Admin" : "Agency Admin"}
              </Badge>
            </div>
          </div>
          <form action={logoutAction} className="mt-3">
            <Button type="submit" variant="outline" size="sm" className="w-full">
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
