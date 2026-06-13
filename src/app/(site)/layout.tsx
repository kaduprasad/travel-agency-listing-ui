import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { getAgencyOrNotFound } from "@/lib/data/agency";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const agency = await getAgencyOrNotFound();
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader agency={agency} />
      <main className="flex-1">{children}</main>
      <SiteFooter agency={agency} />
    </div>
  );
}
