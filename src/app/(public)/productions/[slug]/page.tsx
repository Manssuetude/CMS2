import { notFound } from "next/navigation";
import { ProductionDetail } from "@/components/public/ProductionDetail";
import { contentRepository } from "@/repositories/contentRepository";

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
