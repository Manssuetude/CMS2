import type { Production } from "@/types/cms";

// Classe les productions par pertinence pour le bloc "À lire aussi" : un
// sous-thème partagé compte double par rapport à un tag partagé (relation
// plus précise, choisie explicitement par l'équipe éditoriale), puis on
// départage par date la plus récente.
const SUB_THEME_WEIGHT = 2;
const TAG_WEIGHT = 1;

export function rankRelatedProductions(
  current: Pick<Production, "id" | "tags">,
  currentSubThemeIds: string[],
  candidates: Production[],
  subThemeLinksByProduction: Record<string, string[]>,
  limit = 3,
): Production[] {
  const currentTags = new Set(current.tags.map((t) => t.toLowerCase()));
  const currentSubThemes = new Set(currentSubThemeIds);

  const scored = candidates
    .filter((p) => p.id !== current.id)
    .map((p) => {
      const sharedTags = p.tags.filter((t) => currentTags.has(t.toLowerCase())).length;
      const sharedSubThemes = (subThemeLinksByProduction[p.id] ?? []).filter((id) => currentSubThemes.has(id)).length;
      const score = sharedSubThemes * SUB_THEME_WEIGHT + sharedTags * TAG_WEIGHT;
      return { production: p, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const dateA = a.production.date ? new Date(a.production.date).getTime() : 0;
      const dateB = b.production.date ? new Date(b.production.date).getTime() : 0;
      return dateB - dateA;
    });

  return scored.slice(0, limit).map((entry) => entry.production);
}
