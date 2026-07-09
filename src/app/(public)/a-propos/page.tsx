import { PublicPage } from "@/components/public/PublicPage";
import { contentRepository } from "@/repositories/contentRepository";

export default async function AboutPage() {
  try {
    const page = await contentRepository.getPage("a-propos");
    if (!page) return <p>Page À propos à créer.</p>;
    return <PublicPage page={page} heroImageUrl="/assets/photos/hero-a-propos.png" />;
  } catch {
    // DB unreachable at build time (e.g. no credentials in CI): ISR will populate on first request.
    return <p>Page À propos à créer.</p>;
  }
}
