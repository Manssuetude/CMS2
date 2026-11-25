import type { Metadata } from "next";
import { completeDescription } from "@/utils/seoText";
import { notFound } from "next/navigation";
import { ArticleReader } from "@/components/public/ArticleReader";
import { productionRepository } from "@/repositories/productionRepository";
import { loadProductionPage, productionBasePath } from "@/services/productionReadingService";
import { buildPageMetadata, sectionRobots } from "@/lib/seo";
import { JsonLd } from "@/components/public/JsonLd";
import { buildBreadcrumbJsonLd } from "@/lib/jsonLd";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const robots = await sectionRobots("/productions");
  try {
    const data = await loadProductionPage(slug);
    if (!data) return { robots };
    const { item, imageUrl } = data;
    // Partie 1 = l'article lui-même : on garde le titre de l'article (URL
    // principale, celle qui est partagée et référencée).
    return buildPageMetadata({
      title: item.seoTitle || item.title,
      description:
        item.seoDescription ||
        completeDescription(item.description, [
          "Une production de Manssuétude, think tank jeunesse sur l'Afrique et ses diasporas.",
        ]),
      path: productionBasePath(item.slug),
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
  const data = await loadProductionPage(slug);
  if (!data) notFound();
  const { item } = data;
  const basePath = productionBasePath(item.slug);

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Productions", path: "/productions" },
          { name: item.title, path: basePath },
        ])}
      />
      {/* Toute production passe par la lecture d'article (page de secours sans texte). */}
      <ArticleReader {...data} currentIndex={0} />
    </>
  );
}
