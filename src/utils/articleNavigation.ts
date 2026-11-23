import type { Production } from "@/types/cms";

type NavProduction = Pick<Production, "id" | "slug" | "title" | "date" | "status">;

function time(date: string | null | undefined): number {
  const t = date ? new Date(date).getTime() : NaN;
  return Number.isNaN(t) ? -Infinity : t;
}

function byDateDesc(a: NavProduction, b: NavProduction): number {
  return time(b.date) - time(a.date);
}

/**
 * Article proposé à la fin de la dernière partie : la production publiée
 * suivante du même sous-thème (ordre de la liste du sous-thème : la plus
 * récente d'abord, donc « suivante » = la plus ancienne juste après), sinon la
 * plus récente publiée avant celle-ci. `null` s'il n'y en a pas.
 */
export function pickNextArticle<T extends NavProduction>(
  current: NavProduction,
  currentSubThemeIds: string[],
  allProductions: T[],
  subThemeLinks: Record<string, string[]>,
): T | null {
  const published = allProductions.filter((p) => p.status === "published" || p.id === current.id).sort(byDateDesc);
  const currentTime = time(current.date);

  for (const subThemeId of currentSubThemeIds) {
    const siblings = published.filter((p) => p.id === current.id || subThemeLinks[p.id]?.includes(subThemeId));
    const position = siblings.findIndex((p) => p.id === current.id);
    const next = position >= 0 ? siblings[position + 1] : undefined;
    if (next) return next;
  }

  return published.find((p) => p.id !== current.id && p.status === "published" && time(p.date) < currentTime) ?? null;
}

/**
 * Sépare un titre « Question ? Sous-titre » ou « Sujet : sous-titre » en un
 * titre court (colonne des parties, fil d'Ariane) et un sous-titre (affiché en
 * italique sous le titre). Sans séparateur, le titre reste entier.
 */
export function splitArticleTitle(title: string): { main: string; subtitle: string | null } {
  const trimmed = title.trim();
  const match = /^(.{3,}?)\s*([?:!])\s+(\S.{2,})$/.exec(trimmed);
  if (!match) return { main: trimmed, subtitle: null };
  const [, head, separator, tail] = match;
  const main = separator === ":" ? head.trim() : `${head.trim()}\u00a0${separator}`;
  return { main, subtitle: tail.trim() };
}

/** « 10 » → « 10 pages » ; une valeur déjà libellée est gardée telle quelle. */
export function formatPageCount(pages: string | null | undefined): string | null {
  const value = pages?.trim();
  if (!value) return null;
  if (/^\d+$/.test(value)) return Number(value) > 1 ? `${value} pages` : `${value} page`;
  return value;
}
