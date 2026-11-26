// Estime le temps de lecture d'un contenu HTML riche, à ~200 mots/minute
// (vitesse de lecture silencieuse moyenne en français). Toujours arrondi au
// moins à 1 minute pour éviter un affichage "0 min" sur un contenu court.
const WORDS_PER_MINUTE = 200;

export function estimateReadingTime(html: string | null | undefined): string {
  const text = (html ?? "").replace(/<[^>]+>/g, " ").trim();
  if (!text) return "1 min";
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE));
  return `${minutes} min`;
}

/** Durée de lecture en minutes (même estimation que estimateReadingTime). */
export function readingMinutes(html: string | null | undefined): number | null {
  const text = (html ?? "").replace(/<[^>]+>/g, " ").trim();
  if (!text) return null;
  return Math.max(1, Math.round(text.split(/\s+/).filter(Boolean).length / WORDS_PER_MINUTE));
}

/** « 12 min », « 1 h 05 » saisis à la main → minutes ; null si illisible. */
export function parseReadingMinutes(label: string | null | undefined): number | null {
  const value = label?.trim().toLowerCase();
  if (!value) return null;
  const hours = /(\d+)\s*h/.exec(value);
  const minutes = /(\d+)\s*(?:min|$)/.exec(value.replace(/^\d+\s*h\s*/, ""));
  const total = (hours ? Number(hours[1]) * 60 : 0) + (minutes ? Number(minutes[1]) : 0);
  return total > 0 ? total : null;
}

/**
 * Temps de lecture restant, à partir de la durée totale de l'article et de la
 * progression de lecture (0–100, la même que celle du menu des parties).
 */
export function remainingReadingLabel(totalMinutes: number, percent: number): string {
  const ratio = Math.min(Math.max(Number.isFinite(percent) ? percent : 0, 0), 100) / 100;
  if (ratio >= 1) return "Lecture terminée";
  const remaining = Math.max(0, totalMinutes) * (1 - ratio);
  if (remaining < 1) return "moins d'une minute";
  return `environ ${Math.ceil(remaining)} min`;
}
