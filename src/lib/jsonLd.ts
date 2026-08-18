import { SITE_NAME, SITE_URL } from "@/constants/site";

// Données structurées Schema.org par type de contenu — en complément du
// JSON-LD global (Organization/WebSite) déjà présent dans le layout racine.

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
    headline: input.title,
    description: input.description ?? undefined,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    image: input.imageUrl ? [input.imageUrl] : undefined,
    datePublished: input.datePublished ?? undefined,
    dateModified: input.dateModified ?? input.datePublished ?? undefined,
    author: input.authorName
      ? { "@type": "Person", name: input.authorName }
      : { "@type": "Organization", name: SITE_NAME },
    publisher: { "@type": "Organization", name: SITE_NAME },
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
}): Record<string, unknown> {
  const url = `${SITE_URL}${input.path}`;
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: input.title,
    description: input.description ?? undefined,
    url,
    startDate: input.startDate ?? undefined,
    endDate: input.endDate ?? undefined,
    image: input.imageUrl ? [input.imageUrl] : undefined,
    location: input.location ? { "@type": "Place", name: input.location } : { "@type": "VirtualLocation", url },
    organizer: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
  };
}
