import { PublicPage } from "@/components/public/PublicPage";
import { contentRepository } from "@/repositories/contentRepository";

export default async function JoinPage() {
  const page = await contentRepository.getPage("nous-rejoindre");
  if (!page) return <p>Page Rejoindre à créer.</p>;
  return <PublicPage page={page} heroImageUrl="/assets/photos/hero-nous-rejoindre.png" />;
}
