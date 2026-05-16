import { PublicPage } from "@/components/public/PublicPage";
import { contentRepository } from "@/repositories/contentRepository";

export default async function PercaPage() {
  const page = await contentRepository.getPage("perca");
  if (!page) return <p>Page PERCA à créer.</p>;
  return <PublicPage page={page} heroImageUrl="/assets/photos/hero-perca.png" />;
}
