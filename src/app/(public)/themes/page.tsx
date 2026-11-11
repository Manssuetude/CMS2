import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicPage } from "@/components/public/PublicPage";
import { pageRepository } from "@/repositories/pageRepository";
import { themeRepository } from "@/repositories/themeRepository";
import { MaintenanceNotice } from "@/components/public/MaintenanceNotice";
import { cmsPageMetadata } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return cmsPageMetadata({
    slug: "themes",
    path: "/themes",
    fallbackTitle: "Thèmes",
    fallbackDescription:
      "Économie, souveraineté, institutions, cultures et mémoires : explorez les grands thèmes de réflexion de Manssuétude sur l'Afrique et ses diasporas.",
    navKey: "/themes",
  });
}

export default async function ThemesPage() {
  try {
    const page = await pageRepository.getPage("themes");
    const themes = await themeRepository.listThemes();
    if (!page) notFound();
    // Retire les CTA du hero (« thème actif », etc.) — proposition déplacée en bas.
    const pageNoCta = {
      ...page,
      primaryCtaLabel: null,
      primaryCtaTarget: null,
      secondaryCtaLabel: null,
      secondaryCtaTarget: null,
    };
    return <PublicPage page={pageNoCta} heroImageUrl={page.imageUrl ?? undefined} themes={themes} />;
  } catch (error) {
    if ((error as { digest?: string })?.digest === "NEXT_NOT_FOUND") throw error;
    // DB unreachable at build time (e.g. no credentials in CI): ISR will populate on first request.
    return <MaintenanceNotice />;
  }
}
