// Blocs de la colonne outils de lecture (≥ 1440 px), dans l'ordre d'affichage.
// PDF seulement s'il y a un fichier ; temps restant seulement s'il y a un texte
// à lire (pas sur la page de secours) ; partager et citer toujours.

export type ReadingToolBlock = "pdf" | "time" | "share" | "cite";

export function readingToolBlocks(input: { pdfHref: string | null; totalMinutes: number | null }): ReadingToolBlock[] {
  const blocks: ReadingToolBlock[] = [];
  if (input.pdfHref) blocks.push("pdf");
  if (input.totalMinutes !== null && input.totalMinutes > 0) blocks.push("time");
  blocks.push("share", "cite");
  return blocks;
}
