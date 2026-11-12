import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { PublicChrome } from "@/components/public/PublicChrome";
import { requirePermission } from "@/lib/auth";
import { siteSettingsRepository } from "@/repositories/siteSettingsRepository";
import { announcementService } from "@/services/announcementService";

// Aperçu d'une annonce « comme si elle était en ligne » (bouton Aperçu de
// /admin/annonces). Atteint via /?apercu-annonce=<id> ou
// /nous-rejoindre?apercu-annonce=<id> (réécriture dans middleware.ts).
// Réservé aux comptes autorisés, jamais mis en cache ni indexé.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Aperçu de l'annonce",
  robots: { index: false, follow: false },
};

export default async function AnnouncementPreviewLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  await requirePermission("annonces:view");
  const { id } = await params;
  const announcement = await announcementService.getForPreview(id);
  if (!announcement) notFound();

  let navVisibility = {};
  try {
    navVisibility = await siteSettingsRepository.getNavVisibility();
  } catch {
    // Base injoignable : tout le menu reste visible, comme sur le site public.
  }

  return (
    <PublicChrome announcement={announcement}>
      <SiteHeader
        logoUrl="/assets/photos/logo-manssuetude.webp"
        navVisibility={navVisibility}
        joinBadge={announcement.headerBadge}
      />
      <main className="page-main" id="main-content">
        {children}
      </main>
      <SiteFooter />
      <p className="ann-preview-flag" role="status">
        Aperçu : « {announcement.name} »
      </p>
    </PublicChrome>
  );
}
