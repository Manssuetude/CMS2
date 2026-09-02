import { getSupabaseAdmin } from "@/lib/db";
import { validateUpload } from "@/utils/uploadValidation";
import { logger } from "@/lib/logger";
import type { MediaType } from "@/types/cms";

export function inferMediaType(filename: string): MediaType {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (["jpg", "jpeg", "png", "webp", "svg"].includes(ext || "")) return "image";
  if (["mp4", "mov", "webm"].includes(ext || "")) return "video";
  if (["mp3", "wav", "m4a"].includes(ext || "")) return "audio";
  if (ext === "pdf") return "pdf";
  if (ext === "zip") return "archive";
  return "document";
}

// Les photos importées telles quelles (export appareil/téléphone) dépassent
// largement les dimensions réellement affichées sur le site (aucun
// emplacement n'a besoin de plus de ~2000px de large) — retaille et
// recompresse à l'upload plutôt que de servir l'original en pleine
// résolution (impact direct sur le LCP mobile, cf. audit PageSpeed).
const MAX_IMAGE_DIMENSION = 2000;
const RESIZABLE_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
// 1 an : les fichiers sont adressés par un chemin horodaté (jamais réécrits
// en place), un cache long est donc sans risque de contenu périmé.
const STORAGE_CACHE_CONTROL = "31536000";

async function optimizeImage(bytes: Buffer, mimeType: string): Promise<Buffer> {
  if (!RESIZABLE_IMAGE_TYPES.has(mimeType)) return bytes;
  try {
    // Import dynamique : sharp est un module natif (binaire spécifique à la
    // plateforme). S'il échoue à charger ou à traiter l'image pour une raison
    // quelconque, l'upload ne doit jamais être bloqué pour autant — on retombe
    // sur le fichier original tel quel plutôt que de faire échouer tout envoi
    // (PDF et autres types compris, qui ne passent même pas par cette fonction).
    const sharp = (await import("sharp")).default;
    const image = sharp(bytes).rotate(); // rotate() applique l'orientation EXIF puis la retire
    const metadata = await image.metadata();
    const needsResize = (metadata.width ?? 0) > MAX_IMAGE_DIMENSION || (metadata.height ?? 0) > MAX_IMAGE_DIMENSION;
    const resized = needsResize
      ? image.resize({
          width: MAX_IMAGE_DIMENSION,
          height: MAX_IMAGE_DIMENSION,
          fit: "inside",
          withoutEnlargement: true,
        })
      : image;
    if (mimeType === "image/png") return await resized.png({ quality: 82, effort: 8 }).toBuffer();
    if (mimeType === "image/webp") return await resized.webp({ quality: 82 }).toBuffer();
    return await resized.jpeg({ quality: 82, mozjpeg: true }).toBuffer();
  } catch (error) {
    logger.error("optimizeImage: échec de l'optimisation, envoi du fichier original", {
      mimeType,
      error: error instanceof Error ? error.message : String(error),
    });
    return bytes;
  }
}

export async function uploadToStorage(file: File, folder = "media") {
  validateUpload(file);
  const db = getSupabaseAdmin();
  const path = `${folder}/${Date.now()}-${file.name}`;
  const rawBytes = Buffer.from(await file.arrayBuffer());
  const bytes = await optimizeImage(rawBytes, file.type);
  const { error } = await db.storage.from("manssuetude-media").upload(path, bytes, {
    contentType: file.type,
    upsert: false,
    cacheControl: STORAGE_CACHE_CONTROL,
  });
  if (error) throw error;
  const { data } = db.storage.from("manssuetude-media").getPublicUrl(path);
  return { path, url: data.publicUrl };
}
