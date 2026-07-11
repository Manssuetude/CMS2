import { notFound } from "next/navigation";
import { AboutEditorial } from "@/components/public/AboutEditorial";
import { contentRepository } from "@/repositories/contentRepository";

export default async function AboutPage() {
  try {
    const [page, percaPage] = await Promise.all([
      contentRepository.getPage("a-propos"),
      contentRepository.getPage("perca"),
    ]);
    if (!page) notFound();
    return <AboutEditorial page={page} percaPage={percaPage} />;
  } catch (error) {
    if ((error as { digest?: string })?.digest === "NEXT_NOT_FOUND") throw error;
    // DB unreachable at build time (e.g. no credentials in CI): ISR will populate on first request.
    return <p>Page À propos à créer.</p>;
  }
}
