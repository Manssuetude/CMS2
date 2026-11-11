import type { Metadata } from "next";
import { completeDescription } from "@/utils/seoText";
import { notFound } from "next/navigation";
import { ProductionDetail } from "@/components/public/ProductionDetail";
import { productionRepository } from "@/repositories/productionRepository";
import { mediaRepository } from "@/repositories/mediaRepository";
import { subThemeRepository } from "@/repositories/subThemeRepository";
import { themeRepository } from "@/repositories/themeRepository";
import { authorRepository } from "@/repositories/authorRepository";
import { buildPageMetadata, sectionRobots } from "@/lib/seo";
import { rankRelatedProductions } from "@/utils/relatedProductions";
import { JsonLd } from "@/components/public/JsonLd";
import { buildBreadcrumbJsonLd } from "@/lib/jsonLd";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const robots = await sectionRobots("/productions");
  try {
    const item = await productionRepository.getProduction(slug);
    if (!item) return { robots };
    const imageUrl = await mediaRepository.getResourceUrl(item.thumbnailId);
    return buildPageMetadata({
      title: item.seoTitle || item.title,
      description:
        item.seoDescription ||
        completeDescription(item.description, [
          "Une production de Manssuétude, think tank jeunesse sur l'Afrique et ses diasporas.",
        ]),
      path: `/productions/${item.slug}`,
      imageUrl,
      ogType: "article",
      robots,
    });
  } catch {
    return { robots };
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

  const [
    allThemes,
    allSubThemes,
    subThemeIds,
    fileUrl,
    imageUrl,
    allProductions,
    subThemeLinks,
    authorIds,
    allAuthors,
  ] = await Promise.all([
    themeRepository.listThemes(false),
    subThemeRepository.listSubThemes(false),
    productionRepository.getProductionSubThemeIds(item.id),
    mediaRepository.getResourceUrl(item.fileId),
    mediaRepository.getResourceUrl(item.thumbnailId),
    productionRepository.listProductions(),
    productionRepository.getAllProductionSubThemeLinks(),
    authorRepository.getProductionAuthorIds(item.id),
    authorRepository.listAuthors(),
  ]);

  const enriched = { ...item, subThemeIds };
  const relatedProductions = rankRelatedProductions(item, subThemeIds, allProductions, subThemeLinks);
  const authors = allAuthors.filter((a) => authorIds.includes(a.id));

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Productions", path: "/productions" },
          { name: item.title, path: `/productions/${item.slug}` },
        ])}
      />
      <ProductionDetail
        item={enriched}
        allThemes={allThemes}
        allSubThemes={allSubThemes}
        authors={authors}
        relatedProductions={relatedProductions}
        fileUrl={fileUrl}
        imageUrl={imageUrl}
      />
    </>
  );
}
