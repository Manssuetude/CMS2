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
    const [productions, activities] = await Promise.all([
      contentRepository.listProductions(),
      contentRepository.listActivities(),
    ]);
    if (!page) notFound();
    return (
      <HomeEditorial
        page={page}
        heroImageUrl="/assets/photos/hero-accueil.png"
        focusImageUrl="/assets/photos/card-industrie.png"
        activities={activities}
        productions={productions}
      />
    );
  } catch (error) {
    if ((error as { digest?: string })?.digest === "NEXT_NOT_FOUND") throw error;
    // DB unreachable at build time (e.g. no credentials in CI): ISR will populate on first request.
    return <p>Page d&apos;accueil à créer dans le CMS.</p>;
  }
}
