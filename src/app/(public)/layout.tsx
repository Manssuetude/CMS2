import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export const revalidate = 60;

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="site-shell">
      <SiteHeader logoUrl="/assets/photos/logo-manssuetude.png?v=2" />
      <main className="page-main">{children}</main>
      <SiteFooter />
    </div>
  );
}
