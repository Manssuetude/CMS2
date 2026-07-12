import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ThemeDetail } from "@/components/public/ThemeDetail";
import { contentRepository } from "@/repositories/contentRepository";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const item = await contentRepository.getTheme(slug);
    if (!item) return {};
    return {
      title: item.title,
      description: item.description ?? undefined,
    };
  } catch {
    return {};
  }
}

export async function generateStaticParams() {
  try {
    const items = await contentRepository.listThemes(true);
    return items.map((t) => ({ slug: t.slug }));
  } catch {
    // DB unreachable at build time (e.g. no credentials in CI): render on demand instead.
    return [];
  }
}

export default async function ThemePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await contentRepository.getTheme(slug);
  if (!item) notFound();
  const productions = await contentRepository.getProductionsByTheme(item.id);
  return <ThemeDetail item={item} productions={productions} />;
}
