import { AppError } from "@/lib/errors";
import { downloadFromStorage, removeFromStorage } from "@/lib/media";
import { mediaRepository } from "@/repositories/mediaRepository";
import { convertDocxToHtml, MAX_DOCX_BYTES, type DocxConversion } from "@/utils/docxImport";
import { slugify } from "@/utils/slug";

// Import du texte d'une production depuis un .docx : le fichier a été déposé
// dans le Storage (dossier `imports/`) par le navigateur ; on le lit, on le
// convertit (images envoyées dans la médiathèque), puis on le supprime. Rien
// n'est enregistré sur la production : le HTML est renvoyé à l'éditeur.

export const DOCX_IMPORT_FOLDER = "imports";

export function isDocxImportPath(path: string): boolean {
  return new RegExp(`^${DOCX_IMPORT_FOLDER}/[\\w.-]+\\.docx$`, "i").test(path) && !path.includes("..");
}

export async function importDocxFromStorage(path: string, documentName: string): Promise<DocxConversion> {
  if (!isDocxImportPath(path)) throw new AppError("Fichier d'import invalide.", 400, "DOCX_INVALID_PATH");
  try {
    const buffer = await downloadFromStorage(path);
    if (buffer.byteLength > MAX_DOCX_BYTES) {
      throw new AppError("Fichier trop volumineux (15 Mo maximum).", 400, "DOCX_TOO_LARGE");
    }
    const baseName = slugify(documentName.replace(/\.docx$/i, "")) || "document";
    try {
      return await convertDocxToHtml(buffer, async (image, index) => {
        const file = new File([image.bytes], `${baseName}-image-${index + 1}.${image.extension}`, {
          type: image.contentType,
        });
        const media = await mediaRepository.upload(file, {
          title: image.altText || `${documentName} : image ${index + 1}`,
          alt: image.altText || "",
          tags: "import-word",
          visibility: "public",
        });
        return media.url;
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        "Ce fichier n'a pas pu être lu. Vérifiez qu'il s'agit bien d'un document Word (.docx).",
        400,
        "DOCX_UNREADABLE",
      );
    }
  } finally {
    await removeFromStorage(path);
  }
}
