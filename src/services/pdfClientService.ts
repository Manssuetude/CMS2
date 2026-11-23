import type { Media } from "@/types/cms";
import { mediaClientService } from "@/services/mediaClientService";
import { MAX_UPLOAD_BYTES } from "@/utils/uploadValidation";

// PDF de téléchargement d'une production, côté navigateur : nombre de pages
// lu dans le fichier (pdf.js, déjà embarqué par react-pdf pour la liseuse),
// puis envoi dans la médiathèque. Le PDF n'est rattaché à la production
// qu'à l'enregistrement de la fiche.

// Fichier copié dans public/ (voir PdfViewer).
const PDF_WORKER_SRC = "/pdf.worker.min.mjs";

export function isPdfFile(file: File): boolean {
  return /\.pdf$/i.test(file.name) || file.type === "application/pdf";
}

/** Nombre de pages du PDF, ou null s'il n'a pas pu être lu (à saisir à la main). */
export async function countPdfPages(file: File): Promise<number | null> {
  try {
    const { pdfjs } = await import("react-pdf");
    pdfjs.GlobalWorkerOptions.workerSrc = PDF_WORKER_SRC;
    const document = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
    const pages = document.numPages;
    await document.destroy();
    return pages > 0 ? pages : null;
  } catch {
    return null;
  }
}

export async function uploadProductionPdf(file: File): Promise<{ media: Media; pages: number | null }> {
  if (!isPdfFile(file)) throw new Error("Choisissez un fichier PDF.");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("Fichier trop volumineux (50 Mo maximum).");
  const [media, pages] = await Promise.all([
    mediaClientService.uploadFile(file, {
      title: file.name.replace(/\.pdf$/i, ""),
      tags: "production-pdf",
      visibility: "public",
    }),
    countPdfPages(file),
  ]);
  return { media, pages };
}
