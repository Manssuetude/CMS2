import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { siteSettingsRepository } from "@/repositories/siteSettingsRepository";

// Pages d'aperçu (iframe de l'admin) : même habillage que le site public pour
// un rendu fidèle, mais jamais indexées.
export const metadata: Metadata = {
  title: "Aperçu",
  robots: { index: false, follow: false },
};

export default async function PreviewLayout({ children }: { children: React.ReactNode }) {
  // Même menu que le site public (sections masquées comprises).
  let navVisibility = {};
  try {
    navVisibility = await siteSettingsRepository.getNavVisibility();
  } catch {
    // Base injoignable : tout le menu reste visible, comme sur le site public.
  }
  return (
    <div className="site-shell">
      <SiteHeader logoUrl="/assets/photos/logo-manssuetude.png?v=4" navVisibility={navVisibility} />
      <main className="page-main" id="main-content">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
