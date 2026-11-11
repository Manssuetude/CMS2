import type { Metadata } from "next";
import { cmsPageMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import { PublicPage } from "@/components/public/PublicPage";
import { pageRepository } from "@/repositories/pageRepository";
import { MaintenanceNotice } from "@/components/public/MaintenanceNotice";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return cmsPageMetadata({
    slug: "nous-rejoindre",
    path: "/nous-rejoindre",
    fallbackTitle: "Nous rejoindre",
    fallbackDescription:
      "Rejoignez Manssuétude : contribuez à nos réflexions, événements et projets sur l'Afrique et ses diasporas, et construisons ensemble une voix citoyenne.",
  });
}

export default async function JoinPage() {
  try {
    const page = await pageRepository.getPage("nous-rejoindre");
    if (!page) notFound();
    // Masque le CTA secondaire "Participer à un événement" sur cette page.
    const pageWithoutSecondaryCta = { ...page, secondaryCtaLabel: null, secondaryCtaTarget: null };
    return <PublicPage page={pageWithoutSecondaryCta} heroImageUrl={page.imageUrl ?? undefined} />;
  } catch (error) {
    if ((error as { digest?: string })?.digest === "NEXT_NOT_FOUND") throw error;
    // DB unreachable at build time (e.g. no credentials in CI): ISR will populate on first request.
    return <MaintenanceNotice />;
  }
}
