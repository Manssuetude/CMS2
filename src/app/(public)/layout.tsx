import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { FormatBubbleInteractivity } from "@/components/public/FormatBubbleInteractivity";
import { PublicChrome } from "@/components/public/PublicChrome";
import { siteSettingsRepository } from "@/repositories/siteSettingsRepository";
import { announcementService } from "@/services/announcementService";

export const revalidate = 60;

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  let navVisibility = {};
  try {
    navVisibility = await siteSettingsRepository.getNavVisibility();
  } catch {
    // DB unreachable at build time (e.g. no credentials in CI): tout le menu reste visible.
  }
  // Annonce en ligne : bandeau au-dessus du header + badge sur « Rejoindre ».
  // ISR 60 s : elle apparaît et disparaît au plus une minute après ses dates.
  const announcement = await announcementService.getLive();

  return (
    <PublicChrome announcement={announcement}>
      <SiteHeader
        logoUrl="/assets/photos/logo-manssuetude.webp"
        navVisibility={navVisibility}
        joinBadge={announcement?.headerBadge ?? null}
      />
      <main className="page-main" id="main-content">
        {children}
      </main>
      <SiteFooter />
      <FormatBubbleInteractivity />
    </PublicChrome>
  );
}
