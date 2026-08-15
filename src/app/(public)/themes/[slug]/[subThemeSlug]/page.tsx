import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SubThemeDetail } from "@/components/public/SubThemeDetail";
import { productionRepository } from "@/repositories/productionRepository";
import { subThemeRepository } from "@/repositories/subThemeRepository";
import { themeRepository } from "@/repositories/themeRepository";
import { buildDetailMetadata } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; subThemeSlug: string }>;
}): Promise<Metadata> {
  const { slug, subThemeSlug } = await params;
  try {
    const theme = await themeRepository.getTheme(slug);
    const item = await subThemeRepository.getSubTheme(subThemeSlug);
    if (!theme || !item || item.themeId !== theme.id) return {};
    return buildDetailMetadata({
      title: `${item.title} · ${theme.title}`,
      description: item.longDescription ?? item.description,
      path: `/themes/${theme.slug}/${item.slug}`,
      ogType: "website",
    });
  } catch {
    return {};
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
  const productions = await productionRepository.getProductionsBySubTheme(item.id);
  return <SubThemeDetail theme={theme} item={item} productions={productions} />;
}
