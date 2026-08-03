import type { Metadata } from "next";
import { SITE_NAME, SITE_DESCRIPTION, SITE_LOGO } from "@/constants/site";

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
};

// Construit les métadonnées SEO complètes d'une fiche détail : titre, meta description,
// canonique auto-référencée, Open Graph et Twitter Card avec image dédiée (repli logo).
export function buildDetailMetadata({
  title,
  description,
  path,
  imageUrl,
  ogType = "article",
}: DetailMetadataInput): Metadata {
  const desc = toMetaDescription(description);
  const image = imageUrl ?? SITE_LOGO;
  return {
    title,
    description: desc,
    alternates: { canonical: path },
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
