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
