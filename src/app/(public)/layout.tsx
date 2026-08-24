import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { FormatBubbleInteractivity } from "@/components/public/FormatBubbleInteractivity";
import { siteSettingsRepository } from "@/repositories/siteSettingsRepository";

export const revalidate = 60;

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  let navVisibility = {};
  try {
    navVisibility = await siteSettingsRepository.getNavVisibility();
  } catch {
    // DB unreachable at build time (e.g. no credentials in CI): tout le menu reste visible.
  }

  return (
    <div className="site-shell">
      <a href="#main-content" className="skip-link">
        Aller au contenu
      </a>
      <SiteHeader logoUrl="/assets/photos/logo-manssuetude.png?v=4" navVisibility={navVisibility} />
      <main className="page-main" id="main-content">
        {children}
      </main>
      <SiteFooter />
      <FormatBubbleInteractivity />
    </div>
  );
}
