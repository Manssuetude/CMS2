// Affichage d'une production publique (/productions/[slug]). Un seul schéma de
// lecture (ArticleReader) ; seul ce qui est montré change :
// - "parts"      : texte importé du Word, lu par parties ;
// - "pdf"        : pas de texte, PDF disponible : page de secours avec
//                  l'encadré « disponible en PDF » et le bandeau de téléchargement ;
// - "standfirst" : ni texte ni PDF : en-tête et chapô seuls.
// Pas de lecteur PDF intégré.

export type ProductionReadingMode = "parts" | "pdf" | "standfirst";

export function productionReadingMode(partCount: number, fileUrl: string | null | undefined): ProductionReadingMode {
  if (partCount > 0) return "parts";
  return fileUrl ? "pdf" : "standfirst";
}
