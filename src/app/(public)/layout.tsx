import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export const dynamic = "force-dynamic";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="site-shell">
      <SiteHeader logoUrl="/assets/photos/logo-manssuetude.png" />
      <main className="page-main">{children}</main>
      <SiteFooter />
    </div>
  );
}
