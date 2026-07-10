import { AboutEditorial } from "@/components/public/AboutEditorial";
import { contentRepository } from "@/repositories/contentRepository";

export default async function AboutPage() {
  try {
    const [page, percaPage] = await Promise.all([
      contentRepository.getPage("a-propos"),
      contentRepository.getPage("perca"),
    ]);
    if (!page) return <p>Page À propos à créer.</p>;
    return <AboutEditorial page={page} percaPage={percaPage} />;
  } catch {
    // DB unreachable at build time (e.g. no credentials in CI): ISR will populate on first request.
    return <p>Page À propos à créer.</p>;
  }
}
