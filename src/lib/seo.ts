import type { Metadata } from "next";
import { SITE_NAME, SITE_DESCRIPTION, SITE_LOGO } from "@/constants/site";
import { siteSettingsRepository } from "@/repositories/siteSettingsRepository";

// Tronque une description pour une meta description propre (~160 caractères, coupée sur un mot).
function toMetaDescription(input: string | null | undefined): string {
  const text = (input ?? SITE_DESCRIPTION).replace(/\s+/g, " ").trim();
  if (text.length <= 160) return text;
  const cut = text.slice(0, 160);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 100 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

type DetailMetadataInput = {
  title: string;
  description?: string | null;
  // Chemin absolu du site, ex. "/themes/mon-theme" — sert de canonique auto-référencée.
  path: string;
  // URL de l'image (relative ou absolue) ; repli sur le logo du site.
  imageUrl?: string | null;
  // Type Open Graph (article pour une production, website sinon).
  ogType?: "article" | "website";
  // Voir `sectionRobots` — passé tel quel si la section parente est masquée du menu.
  robots?: Metadata["robots"];
};

// Construit les métadonnées SEO complètes d'une fiche détail : titre, meta description,
// canonique auto-référencée, Open Graph et Twitter Card avec image dédiée (repli logo).
export function buildDetailMetadata({
  title,
  description,
  path,
  imageUrl,
  ogType = "article",
  robots,
}: DetailMetadataInput): Metadata {
  const desc = toMetaDescription(description);
  const image = imageUrl ?? SITE_LOGO;
  return {
    title,
    description: desc,
    alternates: { canonical: path },
    robots,
    openGraph: {
      type: ogType,
      siteName: SITE_NAME,
      title,
      description: desc,
      url: path,
      locale: "fr_FR",
      images: [{ url: image, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: [image],
    },
  };
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
