import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JoinEditorial } from "@/components/public/JoinEditorial";
import { MaintenanceNotice } from "@/components/public/MaintenanceNotice";
import { buildPageMetadata, cmsPageMetadata } from "@/lib/seo";
import { announcementService } from "@/services/announcementService";
import { loadJoinPage } from "@/services/joinPageService";
import { announcementSeo } from "@/utils/announcements";

export const revalidate = 60;

const PATH = "/nous-rejoindre";
const FALLBACK_TITLE = "Nous rejoindre";
const FALLBACK_DESCRIPTION =
  "Rejoignez Manssuétude : contribuez à nos réflexions, événements et projets sur l'Afrique et ses diasporas, et construisons ensemble une voix citoyenne.";

export async function generateMetadata(): Promise<Metadata> {
  const announcement = await announcementService.getLive();
  // Pendant une annonce appliquée à la page : SEO et image de partage de l'annonce.
  // Hors annonce : SEO de la page (/admin/pages/nous-rejoindre).
  if (announcement?.appliesToJoinPage) {
    const seo = announcementSeo(announcement);
    return buildPageMetadata({
      title: seo.title,
      absoluteTitle: seo.title,
      description: seo.description || FALLBACK_DESCRIPTION,
      path: PATH,
      imageUrl: announcement.imageUrl,
    });
  }
  return cmsPageMetadata({
    slug: "nous-rejoindre",
    path: PATH,
    fallbackTitle: FALLBACK_TITLE,
    fallbackDescription: FALLBACK_DESCRIPTION,
  });
}

export default async function JoinPage() {
  try {
    const props = await loadJoinPage(await announcementService.getLive());
    if (!props) notFound();
    return <JoinEditorial {...props} />;
  } catch (error) {
    if ((error as { digest?: string })?.digest === "NEXT_NOT_FOUND") throw error;
    // DB unreachable at build time (e.g. no credentials in CI): ISR will populate on first request.
    return <MaintenanceNotice />;
  }
}
