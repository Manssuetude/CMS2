import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ArticleReader } from "@/components/public/ArticleReader";
import { JsonLd } from "@/components/public/JsonLd";
import { buildBreadcrumbJsonLd } from "@/lib/jsonLd";
import { buildPageMetadata, sectionRobots } from "@/lib/seo";
import { listProductionPartParams, loadProductionPage, productionBasePath } from "@/services/productionReadingService";
import { partExcerpt, partPath } from "@/utils/articleParts";
import { completeDescription } from "@/utils/seoText";

export const revalidate = 60;

type Params = Promise<{ slug: string; partie: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug, partie } = await params;
  const robots = await sectionRobots("/productions");
  try {
    const data = await loadProductionPage(slug);
    const part = data?.parts.find((p, index) => index > 0 && p.slug === partie);
    if (!data || !part) return { robots };
    const { item, parts, imageUrl } = data;
    return buildPageMetadata({
      title: `${part.title} | ${item.seoTitle || item.title}`,
      description: completeDescription(partExcerpt(part), [
        `Partie ${part.index + 1} sur ${parts.length} de « ${item.title} », une production de Manssuétude.`,
      ]),
      path: partPath(productionBasePath(item.slug), parts, part.index),
      // og:image : celle de l'article, pour toutes ses parties.
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
    return await listProductionPartParams();
  } catch {
    // DB injoignable au build (CI sans identifiants) : rendu à la demande.
    return [];
  }
}

export default async function ProductionPartPage({ params }: { params: Params }) {
  const { slug, partie } = await params;
  const data = await loadProductionPage(slug);
  if (!data) notFound();
  const { item, parts } = data;
  const basePath = productionBasePath(item.slug);
  const index = parts.findIndex((p) => p.slug === partie);
  // Partie inconnue (titre renommé, lien ancien), première partie ou article
  // sans parties : on renvoie vers l'article (partie 1) plutôt qu'une 404.
  if (index <= 0) redirect(basePath);
  const part = parts[index];

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Productions", path: "/productions" },
          { name: item.title, path: basePath },
          { name: part.title, path: partPath(basePath, parts, index) },
        ])}
      />
      <ArticleReader {...data} currentIndex={index} />
    </>
  );
}
