import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductionDetail } from "@/components/public/ProductionDetail";
import { contentRepository } from "@/repositories/contentRepository";
import { buildDetailMetadata } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const item = await contentRepository.getProduction(slug);
    if (!item) return {};
    const imageUrl = await contentRepository.getResourceUrl(item.thumbnailId);
    return buildDetailMetadata({
      title: item.title,
      description: item.description,
      path: `/productions/${item.slug}`,
      imageUrl,
      ogType: "article",
    });
  } catch {
    return {};
  }
}

export async function generateStaticParams() {
  try {
    const items = await contentRepository.listProductions(true);
    return items.map((p) => ({ slug: p.slug }));
  } catch {
    // DB unreachable at build time (e.g. no credentials in CI): render on demand instead.
    return [];
  }
}

export default async function ProductionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await contentRepository.getProduction(slug);
  if (!item) notFound();

  const [allThemes, allSubThemes] = await Promise.all([
    contentRepository.listThemes(false),
    contentRepository.listSubThemes(false),
  ]);

  const relatedProductions = item.subThemeId ? await contentRepository.getProductionsBySubTheme(item.subThemeId) : [];

  return (
    <ProductionDetail
      item={item}
      allThemes={allThemes}
      allSubThemes={allSubThemes}
      relatedProductions={relatedProductions}
    />
  );
}
