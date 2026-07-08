import { PublicPage } from "@/components/public/PublicPage";
import { contentRepository } from "@/repositories/contentRepository";

export default async function ProjetsPage() {
  try {
    const page = await contentRepository.getPage("projets");
    const projects = await contentRepository.listProjects();
    if (!page) return <p>Page Projets à créer.</p>;
    return <PublicPage page={page} heroImageUrl="/assets/photos/hero-projets.png" projects={projects} />;
  } catch {
    // DB unreachable at build time (e.g. no credentials in CI): ISR will populate on first request.
    return <p>Page Projets à créer.</p>;
  }
}
