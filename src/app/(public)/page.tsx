import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomeEditorial } from "@/components/public/HomeEditorial";
import { contentRepository } from "@/repositories/contentRepository";
import { MaintenanceNotice } from "@/components/public/MaintenanceNotice";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await contentRepository.getPage("accueil");
    return {
      title: { absolute: page?.seoTitle ?? "Manssuétude" },
      description: page?.seoDescription ?? "Un espace de réflexion, de production et d'expérimentation collective.",
      alternates: { canonical: "/" },
    };
  } catch {
    return {};
  }
}

export default async function HomePage() {
  try {
    const page = await contentRepository.getPage("accueil");
    const [productions, activities, themes] = await Promise.all([
      contentRepository.listProductions(),
      contentRepository.listActivities(),
      contentRepository.listThemes(),
    ]);
    if (!page) notFound();

    // Accueil : productions et thèmes "en vedette" (repli sur les plus récents si aucun n'est marqué).
    // Plafonds : 4 productions, 3 activités, 4 thèmes.
    const featuredProductions = productions.filter((p) => p.featured);
    const homeProductions = (featuredProductions.length ? featuredProductions : productions).slice(0, 4);
    // Activités affichées = uniquement celles marquées en vedette (max 3). Aucune vedette → section masquée.
    const homeActivities = activities.filter((a) => a.featured).slice(0, 3);

    // "Sujet du moment" = le thème sélectionné en admin (page.quote = slug du thème).
    const focusTheme = page.quote ? (themes.find((t) => t.slug === page.quote) ?? null) : null;

    return (
      <HomeEditorial
        page={page}
        heroImageUrl={page.imageUrl ?? undefined}
        focusImageUrl={page.focusImageUrl}
        focusTheme={focusTheme}
        activities={homeActivities}
        productions={homeProductions}
      />
    );
  } catch (error) {
    if ((error as { digest?: string })?.digest === "NEXT_NOT_FOUND") throw error;
    // DB unreachable at build time (e.g. no credentials in CI): ISR will populate on first request.
    return <MaintenanceNotice />;
  }
}
