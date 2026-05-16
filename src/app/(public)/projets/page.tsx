import { PublicPage } from "@/components/public/PublicPage";
import { contentRepository } from "@/repositories/contentRepository";

export default async function ProjetsPage() {
  const page = await contentRepository.getPage("projets");
  const projects = await contentRepository.listProjects();
  if (!page) return <p>Page Projets à créer.</p>;
  return <PublicPage page={page} heroImageUrl="/assets/photos/hero-projets.png" projects={projects} />;
}
