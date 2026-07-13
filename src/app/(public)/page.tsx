import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomeEditorial } from "@/components/public/HomeEditorial";
import { contentRepository } from "@/repositories/contentRepository";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await contentRepository.getPage("accueil");
    return {
      title: { absolute: page?.seoTitle ?? "Manssuétude" },
      description: page?.seoDescription ?? "Un espace de réflexion, de production et d'expérimentation collective.",
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
    const featuredThemes = themes.filter((t) => t.featured);
    const homeThemes = (featuredThemes.length ? featuredThemes : themes).slice(0, 4);
    const homeActivities = activities.slice(0, 3);

    return (
      <HomeEditorial
        page={page}
        heroImageUrl={page.imageUrl ?? "/assets/photos/hero-accueil.png"}
        focusImageUrl={page.focusImageUrl ?? "/assets/photos/card-industrie.png"}
        activities={homeActivities}
        productions={homeProductions}
        themes={homeThemes}
      />
    );
  } catch (error) {
    if ((error as { digest?: string })?.digest === "NEXT_NOT_FOUND") throw error;
    // DB unreachable at build time (e.g. no credentials in CI): ISR will populate on first request.
    return <p>Page d&apos;accueil à créer dans le CMS.</p>;
  }
}
