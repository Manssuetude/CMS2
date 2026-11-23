// Libellés affichés des types de production (la valeur en base est sans accents).
export const PRODUCTION_TYPE_LABELS: Record<string, string> = {
  Article: "Article",
  "Note & Synthese": "Note & Synthèse",
  "Etude & Rapport": "Étude & Rapport",
  Video: "Vidéo",
  Podcast: "Podcast",
  Infographie: "Infographie",
};

export function productionTypeLabel(type: string): string {
  return PRODUCTION_TYPE_LABELS[type] ?? type;
}
