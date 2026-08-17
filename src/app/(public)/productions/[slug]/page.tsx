import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductionDetail } from "@/components/public/ProductionDetail";
import { productionRepository } from "@/repositories/productionRepository";
import { mediaRepository } from "@/repositories/mediaRepository";
import { subThemeRepository } from "@/repositories/subThemeRepository";
import { themeRepository } from "@/repositories/themeRepository";
import { authorRepository } from "@/repositories/authorRepository";
import { buildDetailMetadata } from "@/lib/seo";
import { rankRelatedProductions } from "@/utils/relatedProductions";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const item = await productionRepository.getProduction(slug);
    if (!item) return {};
    const imageUrl = await mediaRepository.getResourceUrl(item.thumbnailId);
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
    const items = await productionRepository.listProductions(true);
    return items.map((p) => ({ slug: p.slug }));
  } catch {
    // DB unreachable at build time (e.g. no credentials in CI): render on demand instead.
    return [];
  }
}

export default async function ProductionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await productionRepository.getProduction(slug);
  if (!item) notFound();

  const [allThemes, allSubThemes, subThemeIds, fileUrl, allProductions, subThemeLinks, authorIds, allAuthors] =
    await Promise.all([
      themeRepository.listThemes(false),
      subThemeRepository.listSubThemes(false),
      productionRepository.getProductionSubThemeIds(item.id),
      mediaRepository.getResourceUrl(item.fileId),
      productionRepository.listProductions(),
      productionRepository.getAllProductionSubThemeLinks(),
      authorRepository.getProductionAuthorIds(item.id),
      authorRepository.listAuthors(),
    ]);

  const enriched = { ...item, subThemeIds };
  const relatedProductions = rankRelatedProductions(item, subThemeIds, allProductions, subThemeLinks);
  const authors = allAuthors.filter((a) => authorIds.includes(a.id));

  return (
    <ProductionDetail
      item={enriched}
      allThemes={allThemes}
      allSubThemes={allSubThemes}
      authors={authors}
      relatedProductions={relatedProductions}
      fileUrl={fileUrl}
    />
  );
}
