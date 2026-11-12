import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import { HomeEditorial } from "@/components/public/HomeEditorial";
import { pageRepository } from "@/repositories/pageRepository";
import { MaintenanceNotice } from "@/components/public/MaintenanceNotice";
import { announcementService } from "@/services/announcementService";
import { loadHomePage } from "@/services/homePageService";

export const revalidate = 60;

const HOME_TITLE = "Manssuétude | Think tank jeunesse sur l'Afrique et ses diasporas";
const HOME_DESCRIPTION =
  "Manssuétude, think tank de jeunes engagés sur l'Afrique et ses diasporas : analyses, débats et projets pour penser et transformer durablement le continent.";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const [page, announcement] = await Promise.all([pageRepository.getPage("accueil"), announcementService.getLive()]);
    // Titre complet modifiable depuis /admin/homepage (champ SEO). L'ancien titre
    // générique « Manssuétude - Accueil » est ignoré au profit du titre par défaut.
    const custom = page?.seoTitle?.trim();
    const title = custom && !/accueil$/i.test(custom) ? custom : HOME_TITLE;
    return buildPageMetadata({
      title,
      absoluteTitle: title,
      description: page?.seoDescription?.trim() || HOME_DESCRIPTION,
      path: "/",
      // Pendant une annonce, l'image de partage est la photo de l'annonce.
      imageUrl: (announcement?.heroEnabled ? announcement.imageUrl : null) ?? page?.imageUrl,
    });
  } catch {
    return buildPageMetadata({
      title: HOME_TITLE,
      absoluteTitle: HOME_TITLE,
      description: HOME_DESCRIPTION,
      path: "/",
    });
  }
}

export default async function HomePage() {
  try {
    const props = await loadHomePage(await announcementService.getLive());
    if (!props) notFound();
    return <HomeEditorial {...props} />;
  } catch (error) {
    if ((error as { digest?: string })?.digest === "NEXT_NOT_FOUND") throw error;
    // DB unreachable at build time (e.g. no credentials in CI): ISR will populate on first request.
    return <MaintenanceNotice />;
  }
}
