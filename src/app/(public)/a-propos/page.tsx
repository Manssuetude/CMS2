import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AboutEditorial } from "@/components/public/AboutEditorial";
import { contentRepository } from "@/repositories/contentRepository";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await contentRepository.getPage("a-propos");
    if (!page) return {};
    return {
      title: { absolute: page.seoTitle ?? page.title },
      description: page.seoDescription ?? undefined,
    };
  } catch {
    return {};
  }
}

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
