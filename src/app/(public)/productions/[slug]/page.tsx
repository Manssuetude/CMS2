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

  const [themeIds, allThemes] = await Promise.all([
    contentRepository.getProductionThemeIds(item.id),
    contentRepository.listThemes(false),
  ]);

  const enriched = { ...item, themeIds };

  const relatedProductions = themeIds.length > 0 ? await contentRepository.getProductionsByTheme(themeIds[0]) : [];

  return <ProductionDetail item={enriched} allThemes={allThemes} relatedProductions={relatedProductions} />;
}
