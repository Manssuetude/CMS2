import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicPage } from "@/components/public/PublicPage";
import { ProposeSection } from "@/components/public/ProposeSection";
import { pageRepository } from "@/repositories/pageRepository";
import { projectRepository } from "@/repositories/projectRepository";
import { MaintenanceNotice } from "@/components/public/MaintenanceNotice";
import { cmsPageMetadata } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return cmsPageMetadata({
    slug: "projets",
    path: "/projets",
    fallbackTitle: "Projets",
    fallbackDescription:
      "Les projets de Manssuétude : transformer les idées en actions concrètes et à impact réel, au service de l'Afrique, de sa jeunesse et de ses diasporas.",
    navKey: "/projets",
  });
}

export default async function ProjetsPage() {
  try {
    const page = await pageRepository.getPage("projets");
    const projects = await projectRepository.listProjects();
    if (!page) notFound();
    // Retire les CTA du hero (« voir notre approche », etc.) — proposition déplacée en bas.
    const pageNoCta = {
      ...page,
      primaryCtaLabel: null,
      primaryCtaTarget: null,
      secondaryCtaLabel: null,
      secondaryCtaTarget: null,
    };
    return (
      <>
        <PublicPage page={pageNoCta} heroImageUrl={page.imageUrl ?? undefined} projects={projects} />
        <ProposeSection
          lead="Vous avez un projet à soumettre à Manssuétude ?"
          label="Proposer un projet"
          target="FORM:project"
        />
      </>
    );
  } catch (error) {
    if ((error as { digest?: string })?.digest === "NEXT_NOT_FOUND") throw error;
    // DB unreachable at build time (e.g. no credentials in CI): ISR will populate on first request.
    return <MaintenanceNotice />;
  }
}
