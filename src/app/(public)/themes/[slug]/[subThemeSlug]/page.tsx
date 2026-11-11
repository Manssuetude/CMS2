import type { Metadata } from "next";
import { mediaRepository } from "@/repositories/mediaRepository";
import { completeDescription } from "@/utils/seoText";
import { notFound } from "next/navigation";
import { SubThemeDetail } from "@/components/public/SubThemeDetail";
import { productionRepository } from "@/repositories/productionRepository";
import { subThemeRepository } from "@/repositories/subThemeRepository";
import { themeRepository } from "@/repositories/themeRepository";
import { buildPageMetadata, sectionRobots } from "@/lib/seo";
import { JsonLd } from "@/components/public/JsonLd";
import { buildBreadcrumbJsonLd } from "@/lib/jsonLd";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; subThemeSlug: string }>;
}): Promise<Metadata> {
  const { slug, subThemeSlug } = await params;
  const robots = await sectionRobots("/themes");
  try {
    const theme = await themeRepository.getTheme(slug);
    const item = await subThemeRepository.getSubTheme(subThemeSlug);
    if (!theme || !item || item.themeId !== theme.id) return { robots };
    return buildPageMetadata({
      title: `${item.title} · ${theme.title}`,
      description: completeDescription(item.description || item.longDescription, [
        `Un sujet traité par Manssuétude dans le thème « ${theme.title} ».`,
        "Think tank jeunesse sur l'Afrique et ses diasporas.",
      ]),
      path: `/themes/${theme.slug}/${item.slug}`,
      imageUrl: await mediaRepository.getResourceUrl(theme.heroImageId ?? theme.thumbnailId),
      robots,
    });
  } catch {
    return { robots };
  }
}

export async function generateStaticParams() {
  try {
    const [themes, subThemes] = await Promise.all([
      themeRepository.listThemes(true),
      subThemeRepository.listSubThemes(true),
    ]);
    const themeById = new Map(themes.map((t) => [t.id, t]));
    return subThemes
      .map((st) => {
        const theme = themeById.get(st.themeId);
        return theme ? { slug: theme.slug, subThemeSlug: st.slug } : null;
      })
      .filter((v): v is { slug: string; subThemeSlug: string } => v !== null);
  } catch {
    // DB unreachable at build time (e.g. no credentials in CI): render on demand instead.
    return [];
  }
}

export default async function SubThemePage({ params }: { params: Promise<{ slug: string; subThemeSlug: string }> }) {
  const { slug, subThemeSlug } = await params;
  const theme = await themeRepository.getTheme(slug);
  if (!theme) notFound();
  const item = await subThemeRepository.getSubTheme(subThemeSlug);
  if (!item || item.themeId !== theme.id) notFound();
  const [productions, allSubThemes] = await Promise.all([
    productionRepository.getProductionsBySubTheme(item.id),
    subThemeRepository.listSubThemes(),
  ]);
  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Thèmes", path: "/themes" },
          { name: theme.title, path: `/themes/${theme.slug}` },
          { name: item.title, path: `/themes/${theme.slug}/${item.slug}` },
        ])}
      />
      <SubThemeDetail theme={theme} item={item} productions={productions} allSubThemes={allSubThemes} />
    </>
  );
}
