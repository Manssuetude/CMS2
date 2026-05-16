import { PublicPage } from "@/components/public/PublicPage";
import { contentRepository } from "@/repositories/contentRepository";

export default async function HomePage() {
  const page = await contentRepository.getPage("accueil");
  const productions = await contentRepository.listProductions();
  const projects = await contentRepository.listProjects();
  if (!page) return <p>Page d&apos;accueil à créer dans le CMS.</p>;
  return (
    <PublicPage
      page={page}
      heroImageUrl="/assets/photos/hero-accueil.png"
      productions={productions.slice(0, 4)}
      projects={projects.slice(0, 2)}
    />
  );
}
