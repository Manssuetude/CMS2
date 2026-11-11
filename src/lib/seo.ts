import type { Metadata } from "next";
import { SITE_NAME, SITE_DESCRIPTION, SITE_LOGO } from "@/constants/site";
import { mediaRepository } from "@/repositories/mediaRepository";
import { pageRepository } from "@/repositories/pageRepository";
import { siteSettingsRepository } from "@/repositories/siteSettingsRepository";
import { stripBrandSuffix, toMetaDescription } from "@/utils/seoText";

type PageMetadataInput = {
  // Titre de la page, sans la marque : le gabarit « %s | Manssuétude » du
  // layout racine l'ajoute (un suffixe déjà présent est retiré).
  title: string;
  // Titre complet imposé tel quel (accueil uniquement).
  absoluteTitle?: string;
  // Meta description finale (voir completeDescription) ; repli sur la description du site.
  description?: string | null;
  // Chemin absolu du site, ex. "/themes/mon-theme" — canonique auto-référencée,
  // rendue en URL absolue grâce à metadataBase.
  path: string;
  // URL de l'image (relative ou absolue) ; repli sur le logo du site.
  imageUrl?: string | null;
  // « article » pour les productions et le journal, « website » partout ailleurs.
  ogType?: "article" | "website";
  // Voir `sectionRobots` — passé tel quel si la section parente est masquée du menu.
  robots?: Metadata["robots"];
};

// Métadonnées SEO complètes de n'importe quelle page publique : titre, meta
// description, canonique, Open Graph et Twitter Card avec image (repli logo).
// Chaque page doit définir son propre openGraph : sinon elle hérite de celui de
// l'accueil (og:url et og:title de la page d'accueil sur toutes les pages).
export function buildPageMetadata({
  title,
  absoluteTitle,
  description,
  path,
  imageUrl,
  ogType = "website",
  robots,
}: PageMetadataInput): Metadata {
  const cleanTitle = stripBrandSuffix(title);
  const socialTitle = absoluteTitle ?? cleanTitle;
  const desc = toMetaDescription(description?.trim() ? description : SITE_DESCRIPTION);
  const image = imageUrl ?? SITE_LOGO;
  return {
    title: absoluteTitle ? { absolute: absoluteTitle } : cleanTitle,
    description: desc,
    alternates: { canonical: path },
    robots,
    openGraph: {
      type: ogType,
      siteName: SITE_NAME,
      title: socialTitle,
      description: desc,
      url: path,
      locale: "fr_FR",
      images: [{ url: image, alt: socialTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description: desc,
      images: [image],
    },
  };
}

// Pages éditées depuis l'admin (table `pages`) : titre court (seo_title sans la
// marque, sinon `fallbackTitle` — `pages.title` est une phrase d'accroche, pas un
// titre d'onglet), seo_description, image SEO puis image de la page.
export async function cmsPageMetadata({
  slug,
  path,
  fallbackTitle,
  fallbackDescription,
  navKey,
}: {
  slug: string;
  path: string;
  fallbackTitle: string;
  // Utilisée tant que seo_description est vide en base (140-160 caractères).
  fallbackDescription: string;
  navKey?: string;
}): Promise<Metadata> {
  const robots = navKey ? await sectionRobots(navKey) : undefined;
  try {
    const page = await pageRepository.getPage(slug);
    const seoImageUrl = page?.seoImageId ? await mediaRepository.getResourceUrl(page.seoImageId) : null;
    return buildPageMetadata({
      title: page?.seoTitle?.trim() ? page.seoTitle : fallbackTitle,
      description: page?.seoDescription?.trim() || fallbackDescription,
      path,
      imageUrl: seoImageUrl ?? page?.imageUrl,
      robots,
    });
  } catch {
    // DB injoignable (ex. build sans credentials) : métadonnées minimales mais correctes.
    return buildPageMetadata({ title: fallbackTitle, description: fallbackDescription, path, robots });
  }
}

// Masquer une section du menu public (voir MAIN_NAV_ITEMS, src/constants/site.ts,
// géré depuis /admin/pages) doit aussi retirer de l'indexation Google la page de
// section ET toutes ses pages de détail (ex : masquer « Journal » retire
// /journal ET /journal/mon-article de l'indexation, pas seulement le lien du
// menu). Chaque page de la section (listing + détail) appelle cette fonction
// avec la clé de section correspondante (ex. "/journal") dans generateMetadata.
export async function sectionRobots(navKey: string): Promise<Metadata["robots"]> {
  try {
    const navVisibility = await siteSettingsRepository.getNavVisibility();
    if (navVisibility[navKey] === false) {
      return { index: false, follow: false };
    }
  } catch {
    // Erreur de connexion DB (ex. build sans credentials) : ne pas bloquer
    // l'indexation par défaut, l'incertitude ne doit jamais coûter le SEO.
  }
  return undefined;
}
