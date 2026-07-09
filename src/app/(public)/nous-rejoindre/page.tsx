import { PublicPage } from "@/components/public/PublicPage";
import { contentRepository } from "@/repositories/contentRepository";

export default async function JoinPage() {
  try {
    const page = await contentRepository.getPage("nous-rejoindre");
    if (!page) return <p>Page Rejoindre à créer.</p>;
    return <PublicPage page={page} heroImageUrl="/assets/photos/hero-nous-rejoindre.png" />;
  } catch {
    // DB unreachable at build time (e.g. no credentials in CI): ISR will populate on first request.
    return <p>Page Rejoindre à créer.</p>;
  }
}
