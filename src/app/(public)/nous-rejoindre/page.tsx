import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicPage } from "@/components/public/PublicPage";
import { contentRepository } from "@/repositories/contentRepository";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await contentRepository.getPage("nous-rejoindre");
    if (!page) return {};
    return {
      title: { absolute: page.seoTitle ?? page.title },
      description: page.seoDescription ?? undefined,
    };
  } catch {
    return {};
  }
}

export default async function JoinPage() {
  try {
    const page = await contentRepository.getPage("nous-rejoindre");
    if (!page) notFound();
    return <PublicPage page={page} heroImageUrl={page.imageUrl ?? "/assets/photos/hero-nous-rejoindre.png"} />;
  } catch (error) {
    if ((error as { digest?: string })?.digest === "NEXT_NOT_FOUND") throw error;
    // DB unreachable at build time (e.g. no credentials in CI): ISR will populate on first request.
    return <p>Page Rejoindre à créer.</p>;
  }
}
