import { SITE_LOGO, SITE_NAME, SITE_URL } from "@/constants/site";
import { toHeadline } from "@/utils/seoText";

// Données structurées Schema.org par type de contenu — en complément du
// JSON-LD global (Organization/WebSite) déjà présent dans le layout racine.
// Validées contre les champs requis/recommandés de Google (Rich Results).

function absoluteUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  return url.startsWith("http") ? url : `${SITE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

// Organisation éditrice / organisatrice (logo absolu, requis par Google pour
// le publisher d'un Article).
const ORGANIZATION = {
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: { "@type": "ImageObject", url: `${SITE_URL}${SITE_LOGO}` },
};

export function buildArticleJsonLd(input: {
  title: string;
  description?: string | null;
  path: string;
  imageUrl?: string | null;
  authorName?: string | null;
  datePublished?: string | null;
  dateModified?: string | null;
}): Record<string, unknown> {
  const url = `${SITE_URL}${input.path}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: toHeadline(input.title),
    description: input.description ?? undefined,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    // Image toujours renseignée (recommandée par Google) : repli sur le logo.
    image: [absoluteUrl(input.imageUrl) ?? `${SITE_URL}${SITE_LOGO}`],
    datePublished: input.datePublished ?? undefined,
    dateModified: input.dateModified ?? input.datePublished ?? undefined,
    // Auteur « Manssuétude » (production collective) : l'organisation, pas une personne.
    author:
      input.authorName && input.authorName.trim() !== SITE_NAME
        ? input.authorName.split(/\s*,\s*/).map((name) => ({ "@type": "Person", name }))
        : ORGANIZATION,
    publisher: ORGANIZATION,
  };
}

export function buildEventJsonLd(input: {
  title: string;
  description?: string | null;
  path: string;
  startDate?: string | null;
  endDate?: string | null;
  location?: string | null;
  imageUrl?: string | null;
  // Lien d'inscription (Eventbrite…) : exposé comme offre.
  registrationUrl?: string | null;
}): Record<string, unknown> {
  const url = `${SITE_URL}${input.path}`;
  const location = input.location?.trim();
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: input.title,
    description: input.description ?? undefined,
    url,
    startDate: input.startDate ?? undefined,
    endDate: input.endDate ?? undefined,
    image: [absoluteUrl(input.imageUrl) ?? `${SITE_URL}${SITE_LOGO}`],
    // `location` est un texte libre saisi par l'équipe : on l'expose comme nom
    // et comme adresse (Google exige une adresse pour un Place).
    location: location ? { "@type": "Place", name: location, address: location } : { "@type": "VirtualLocation", url },
    organizer: ORGANIZATION,
    eventAttendanceMode: location
      ? "https://schema.org/OfflineEventAttendanceMode"
      : "https://schema.org/OnlineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    offers: input.registrationUrl
      ? { "@type": "Offer", url: input.registrationUrl, availability: "https://schema.org/InStock" }
      : undefined,
  };
}

// Fil d'Ariane (BreadcrumbList) des fiches de détail : Accueil > Section > Fiche.
export function buildBreadcrumbJsonLd(items: Array<{ name: string; path: string }>): Record<string, unknown> {
  const trail = [{ name: "Accueil", path: "/" }, ...items];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path === "/" ? "" : item.path}`,
    })),
  };
}
