import { PublicPage } from "@/components/public/PublicPage";
import { contentRepository } from "@/repositories/contentRepository";

export default async function ThemesPage() {
  const page = await contentRepository.getPage("themes");
  const themes = await contentRepository.listThemes();
  if (!page) return <p>Page Thèmes à créer.</p>;
  return <PublicPage page={page} heroImageUrl="/assets/photos/hero-themes.png" themes={themes} />;
}
