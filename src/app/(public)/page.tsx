import { HomeEditorial } from "@/components/public/HomeEditorial";
import { contentRepository } from "@/repositories/contentRepository";

export default async function HomePage() {
  try {
    const page = await contentRepository.getPage("accueil");
    const [productions, activities] = await Promise.all([
      contentRepository.listProductions(),
      contentRepository.listActivities(),
    ]);
    if (!page) return <p>Page d&apos;accueil à créer dans le CMS.</p>;
    return (
      <HomeEditorial
        page={page}
        heroImageUrl="/assets/photos/hero-accueil.png"
        focusImageUrl="/assets/photos/card-industrie.png"
        activities={activities}
        productions={productions}
      />
    );
  } catch {
    // DB unreachable at build time (e.g. no credentials in CI): ISR will populate on first request.
    return <p>Page d&apos;accueil à créer dans le CMS.</p>;
  }
}
