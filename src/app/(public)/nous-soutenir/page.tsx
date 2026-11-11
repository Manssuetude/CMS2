import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicPage } from "@/components/public/PublicPage";
import { pageRepository } from "@/repositories/pageRepository";
import { MaintenanceNotice } from "@/components/public/MaintenanceNotice";
import { cmsPageMetadata } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return cmsPageMetadata({
    slug: "nous-soutenir",
    path: "/nous-soutenir",
    fallbackTitle: "Nous soutenir",
    fallbackDescription:
      "Soutenez Manssuétude : dons, partenariats et mécénat pour financer les productions, les événements et les projets d'une jeunesse engagée pour l'Afrique.",
    navKey: "/nous-soutenir",
  });
}

export default async function SupportPage() {
  try {
    const page = await pageRepository.getPage("nous-soutenir");
    if (!page) notFound();
    return <PublicPage page={page} heroImageUrl={page.imageUrl ?? undefined} />;
  } catch (error) {
    if ((error as { digest?: string })?.digest === "NEXT_NOT_FOUND") throw error;
    // DB unreachable at build time (e.g. no credentials in CI): ISR will populate on first request.
    return <MaintenanceNotice />;
  }
}
