import type { ContentStatus } from "@/types/cms";

/** Statuts proposés comme filtres dans les listes admin (sous-ensemble de ContentStatus). */
export type FilterStatus = "draft" | "published" | "archived";

const FILTER_STATUSES: FilterStatus[] = ["draft", "published", "archived"];

/** Libellés au singulier, partagés par les onglets, l'en-tête et les badges. */
export const STATUS_LABELS: Record<FilterStatus, string> = {
  draft: "Brouillon",
  published: "Publié",
  archived: "Archivé",
};

/** Renvoie le statut de filtre demandé s'il est valide, sinon null (= « tous »). */
export function resolveActiveStatus(status: string | undefined): FilterStatus | null {
  return FILTER_STATUSES.includes(status as FilterStatus) ? (status as FilterStatus) : null;
}

/** Compte les éléments par statut de filtre, plus le total. */
export function countByStatus(items: { status: ContentStatus }[]) {
  return {
    all: items.length,
    published: items.filter((i) => i.status === "published").length,
    draft: items.filter((i) => i.status === "draft").length,
    archived: items.filter((i) => i.status === "archived").length,
  };
}

export type StatusTab = { key: FilterStatus | null; label: string; count: number };

/**
 * Construit les onglets de filtre. `gender` gère l'accord français des libellés
 * ("Toutes/Publiées/Archivées" au féminin, "Tous/Publiés/Archivés" au masculin).
 */
export function buildStatusTabs(counts: ReturnType<typeof countByStatus>, gender: "f" | "m"): StatusTab[] {
  const suffix = gender === "f" ? "es" : "s";
  return [
    { key: null, label: gender === "f" ? "Toutes" : "Tous", count: counts.all },
    { key: "published", label: `Publié${suffix}`, count: counts.published },
    { key: "draft", label: "Brouillons", count: counts.draft },
    { key: "archived", label: `Archivé${suffix}`, count: counts.archived },
  ];
}
