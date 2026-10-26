import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { AGENCY } from "@/lib/data/site-data";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader agency={AGENCY} />
      <main className="flex-1">{children}</main>
      <SiteFooter agency={AGENCY} />
    </div>
  );
}
