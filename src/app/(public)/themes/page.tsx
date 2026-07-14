import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicPage } from "@/components/public/PublicPage";
import { ProposeSection } from "@/components/public/ProposeSection";
import { contentRepository } from "@/repositories/contentRepository";
import { MaintenanceNotice } from "@/components/public/MaintenanceNotice";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await contentRepository.getPage("themes");
    if (!page) return {};
    return {
      title: { absolute: page.seoTitle ?? page.title },
      description: page.seoDescription ?? undefined,
    };
  } catch {
    return {};
  }
}

export default async function ThemesPage() {
  try {
    const page = await contentRepository.getPage("themes");
    const themes = await contentRepository.listThemes();
    if (!page) notFound();
    // Retire les CTA du hero (« thème actif », etc.) — proposition déplacée en bas.
    const pageNoCta = {
      ...page,
      primaryCtaLabel: null,
      primaryCtaTarget: null,
      secondaryCtaLabel: null,
      secondaryCtaTarget: null,
    };
    return (
      <>
        <PublicPage page={pageNoCta} heroImageUrl={page.imageUrl ?? "/assets/photos/hero-themes.png"} themes={themes} />
        <ProposeSection
          lead="Vous souhaitez proposer un thème de réflexion ?"
          label="Proposer un thème"
          target="FORM:theme"
        />
      </>
    );
  } catch (error) {
    if ((error as { digest?: string })?.digest === "NEXT_NOT_FOUND") throw error;
    // DB unreachable at build time (e.g. no credentials in CI): ISR will populate on first request.
    return <MaintenanceNotice />;
  }
}
