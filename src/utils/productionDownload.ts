import { splitArticleTitle } from "./articleNavigation";

// Téléchargement direct du PDF d'une production (route
// /productions/[slug]/telecharger). Le fichier ne transite pas par le serveur :
// la route redirige vers l'URL publique du Storage avec le paramètre
// `download`, et Supabase répond alors en pièce jointe (Content-Disposition:
// attachment) sous un nom de fichier lisible.

const SHORT_TITLE_MAX = 100;
const SUPABASE_PUBLIC_OBJECT = "/storage/v1/object/public/";

export const productionDownloadPath = (slug: string) => `/productions/${slug}/telecharger`;

/**
 * « Manssuétude - <titre court>.pdf ». Accents gardés ; caractères interdits
 * dans un nom de fichier (/ \ : * ? " < > | et caractères de contrôle) retirés ;
 * titre court limité à 100 caractères.
 */
export function pdfDownloadFileName(title: string): string {
  const { main } = splitArticleTitle(title ?? "");
  // Caractères de contrôle (codes < 32 et 127) remplacés par une espace.
  const printable = Array.from(main.normalize("NFC"), (char) => {
    const code = char.charCodeAt(0);
    return code < 32 || code === 127 ? " " : char;
  }).join("");
  let short = printable
    .replace(/[/\\:*?"<>|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (short.length > SHORT_TITLE_MAX) {
    const cut = short.slice(0, SHORT_TITLE_MAX);
    const lastSpace = cut.lastIndexOf(" ");
    short = lastSpace > SHORT_TITLE_MAX * 0.6 ? cut.slice(0, lastSpace) : cut;
  }
  short = short.replace(/[\s.\-–]+$/, "");
  return `Manssuétude - ${short || "article"}.pdf`;
}

/**
 * URL publique du fichier avec le paramètre `download` (nom de fichier encodé).
 * Un fichier hors du Storage Supabase (lien externe) est renvoyé tel quel.
 */
export function pdfDownloadUrl(fileUrl: string, fileName: string): string {
  let url: URL;
  try {
    url = new URL(fileUrl);
  } catch {
    return fileUrl;
  }
  if (!url.pathname.includes(SUPABASE_PUBLIC_OBJECT)) return fileUrl;
  url.searchParams.set("download", fileName);
  return url.toString();
}

export type ProductionDownload = { status: 404 } | { status: 302; location: string; fileName: string };

/** 404 si production inconnue, non publiée ou sans PDF ; sinon redirection vers le fichier. */
export function resolveProductionDownload(
  production: { title: string; status: string } | null,
  fileUrl: string | null | undefined,
): ProductionDownload {
  if (!production || production.status !== "published" || !fileUrl) return { status: 404 };
  const fileName = pdfDownloadFileName(production.title);
  return { status: 302, location: pdfDownloadUrl(fileUrl, fileName), fileName };
}
