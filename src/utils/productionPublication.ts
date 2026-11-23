import type { ContentStatus } from "@/types/cms";

// Règle de publication des productions : chacune a un Word (texte lu sur le
// site, découpé en parties) et un PDF (téléchargement). Pur : utilisé par
// l'interface (bouton Enregistrer, avertissements) et par les actions serveur.
//
// - Une production qui PASSE en « Publié » (création, brouillon ou archive
//   republiée) doit avoir les deux fichiers.
// - Une production DÉJÀ publiée sans l'un des deux reste en ligne et
//   modifiable : simple avertissement (rattrapage de l'existant).

export type ProductionFile = "word" | "pdf";

export type ProductionFilesState = {
  /** Texte de l'article présent (`body` non vide). */
  hasWord: boolean;
  /** PDF de téléchargement attaché (`file_id`). */
  hasPdf: boolean;
};

export type PublicationCheck = {
  /** Faux uniquement quand l'enregistrement doit être refusé. */
  allowed: boolean;
  missing: ProductionFile[];
  /** Production déjà publiée à qui il manque un fichier : avertir sans bloquer. */
  legacyWarning: boolean;
};

export function missingProductionFiles({ hasWord, hasPdf }: ProductionFilesState): ProductionFile[] {
  const missing: ProductionFile[] = [];
  if (!hasWord) missing.push("word");
  if (!hasPdf) missing.push("pdf");
  return missing;
}

export function checkProductionPublication(input: {
  /** Statut actuellement enregistré (null pour une nouvelle production). */
  previousStatus: ContentStatus | null;
  nextStatus: ContentStatus;
  files: ProductionFilesState;
}): PublicationCheck {
  const missing = missingProductionFiles(input.files);
  if (input.nextStatus !== "published" || missing.length === 0) {
    return { allowed: true, missing, legacyWarning: false };
  }
  const alreadyPublished = input.previousStatus === "published";
  return { allowed: alreadyPublished, missing, legacyWarning: alreadyPublished };
}

const FILE_LABELS: Record<ProductionFile, string> = { word: "le Word", pdf: "le PDF" };

function listMissing(missing: ProductionFile[]): string {
  return missing.map((file) => FILE_LABELS[file]).join(" et ");
}

/** « Il manque le PDF : impossible d'enregistrer en « Publié » ». */
export function publicationBlockedMessage(missing: ProductionFile[]): string {
  return `Il manque ${listMissing(missing)} : impossible d'enregistrer en « Publié »`;
}

/** Avertissement pour une production déjà en ligne à qui il manque un fichier. */
export function publicationLegacyMessage(missing: ProductionFile[]): string {
  return `Production en ligne sans ${missing.map((file) => (file === "word" ? "Word" : "PDF")).join(" ni ")} : elle reste publiée, ajoutez ${missing.length > 1 ? "les fichiers" : listMissing(missing)} dès que possible.`;
}
