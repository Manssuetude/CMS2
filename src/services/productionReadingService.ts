import { cache } from "react";
import type { Author, Production, SubTheme, Theme } from "@/types/cms";
import { authorRepository } from "@/repositories/authorRepository";
import { mediaRepository } from "@/repositories/mediaRepository";
import { productionRepository } from "@/repositories/productionRepository";
import { subThemeRepository } from "@/repositories/subThemeRepository";
import { themeRepository } from "@/repositories/themeRepository";
import { splitIntoParts, type ArticlePart } from "@/utils/articleParts";
import { pickNextArticle } from "@/utils/articleNavigation";
import { rankRelatedProductions } from "@/utils/relatedProductions";

// Données des pages publiques d'une production (/productions/[slug] et
// /productions/[slug]/[partie]). Lecture seule. Mémoïsé par requête (`cache`)
// pour que generateMetadata et la page ne refassent pas les mêmes lectures.

export const productionBasePath = (slug: string) => `/productions/${slug}`;

export type ProductionPageData = {
  item: Production & { subThemeIds: string[] };
  allThemes: Theme[];
  allSubThemes: SubTheme[];
  authors: Author[];
  relatedProductions: Production[];
  fileUrl: string | null;
  imageUrl: string | null;
  /** Vide si la production n'a pas de `body` : page de secours (voir utils/productionReading). */
  parts: ArticlePart[];
  nextArticle: Pick<Production, "slug" | "title"> | null;
};

/**
 * Données de lecture d'une production donnée (enregistrée ou non). `links`
 * fournit les sous-thèmes et auteurs quand ils viennent d'un formulaire non
 * enregistré (aperçu admin) ; sinon ils sont lus en base.
 */
export async function buildProductionPageData(
  item: Production,
  links?: { subThemeIds: string[]; authorIds: string[] },
): Promise<ProductionPageData> {
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
    links ? links.subThemeIds : productionRepository.getProductionSubThemeIds(item.id),
    mediaRepository.getResourceUrl(item.fileId),
    mediaRepository.getResourceUrl(item.thumbnailId),
    productionRepository.listProductions(),
    productionRepository.getAllProductionSubThemeLinks(),
    links ? links.authorIds : authorRepository.getProductionAuthorIds(item.id),
    authorRepository.listAuthors(),
  ]);

  const parts = item.body ? splitIntoParts(item.body, { basePath: productionBasePath(item.slug) }) : [];
  const next = parts.length > 0 ? pickNextArticle(item, subThemeIds, allProductions, subThemeLinks) : null;

  return {
    item: { ...item, subThemeIds },
    allThemes,
    allSubThemes,
    authors: allAuthors.filter((a) => authorIds.includes(a.id)),
    relatedProductions: rankRelatedProductions(item, subThemeIds, allProductions, subThemeLinks),
    fileUrl,
    imageUrl,
    parts,
    nextArticle: next ? { slug: next.slug, title: next.title } : null,
  };
}

export const loadProductionPage = cache(async (slug: string): Promise<ProductionPageData | null> => {
  const item = await productionRepository.getProduction(slug);
  return item ? buildProductionPageData(item) : null;
});

/** Chemins publics à pré-générer : l'article (partie 1) et ses autres parties. */
export async function listProductionPartParams(): Promise<Array<{ slug: string; partie: string }>> {
  const items = await productionRepository.listProductions(true);
  return items
    .filter((p) => p.status === "published" && p.body)
    .flatMap((p) =>
      splitIntoParts(p.body)
        .slice(1)
        .map((part) => ({ slug: p.slug, partie: part.slug })),
    );
}
