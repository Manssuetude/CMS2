import { imageSize } from "image-size";
import { getSupabaseAdmin } from "@/lib/db";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { validateUpload } from "@/utils/uploadValidation";
import { slugify } from "@/utils/slug";
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

// 1 an : les fichiers sont adressés par un chemin horodaté (jamais réécrits
// en place), un cache long est donc sans risque de contenu périmé.
const STORAGE_CACHE_CONTROL = "31536000";

// Supabase Storage rejette les clés d'objet contenant espaces/accents/certains
// caractères spéciaux ("Invalid key") — un nom de fichier saisi normalement par
// un utilisateur (ex. "note de synthèse - Vdef.pdf") faisait donc échouer
// l'upload. On nettoie le nom, en gardant l'extension intacte.
function sanitizeFilename(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  const hasExt = lastDot > 0 && lastDot < filename.length - 1;
  const base = hasExt ? filename.slice(0, lastDot) : filename;
  const ext = hasExt ? filename.slice(lastDot + 1).toLowerCase() : "";
  const safeBase = slugify(base) || "fichier";
  return ext ? `${safeBase}.${ext}` : safeBase;
}

// Ticket d'upload signé : le binaire est envoyé directement du navigateur vers
// Supabase Storage, sans jamais transiter par notre fonction serveur — les
// fonctions Vercel ont une limite de taille de requête bien inférieure à ce
// qu'un fichier média peut peser (une photo d'appareil photo dépasse souvent
// cette limite), ce qui faisait échouer l'upload en production avec un 413
// avant même d'atteindre notre code. Voir mediaClientService.uploadFile.
export async function createUploadTicket(filename: string, folder = "media") {
  const db = getSupabaseAdmin();
  const path = `${folder}/${Date.now()}-${sanitizeFilename(filename)}`;
  const { data, error } = await db.storage.from("manssuetude-media").createSignedUploadUrl(path);
  if (error) throw error;
  const { data: publicUrlData } = db.storage.from("manssuetude-media").getPublicUrl(path);
  return { path, token: data.token, url: publicUrlData.publicUrl };
}

export async function uploadToStorage(file: File, folder = "media") {
  validateUpload(file);
  const db = getSupabaseAdmin();
  const path = `${folder}/${Date.now()}-${sanitizeFilename(file.name)}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  const { error } = await db.storage.from("manssuetude-media").upload(path, bytes, {
    contentType: file.type,
    upsert: false,
    cacheControl: STORAGE_CACHE_CONTROL,
  });
  if (error) throw error;
  const { data } = db.storage.from("manssuetude-media").getPublicUrl(path);
  return { path, url: data.publicUrl };
}

export type ImageDimensions = { width: number; height: number };

// Taille lue en premier : l'en-tête d'un JPEG (EXIF compris) tient presque
// toujours dans les 128 premiers Ko — inutile de rapatrier une photo de 6 Mo.
const DIMENSIONS_PROBE_BYTES = 128 * 1024;

// Dimensions affichées (rotation EXIF appliquée : une photo de téléphone en
// portrait est souvent stockée en paysage avec une orientation 5 à 8).
export function dimensionsFromBytes(bytes: Uint8Array): ImageDimensions | null {
  const result = imageSize(bytes);
  if (!result.width || !result.height) return null;
  const rotated = (result.orientation ?? 1) >= 5;
  return rotated ? { width: result.height, height: result.width } : { width: result.width, height: result.height };
}

function isOwnStorageUrl(url: string): boolean {
  if (!env.NEXT_PUBLIC_SUPABASE_URL) return false;
  try {
    return new URL(url).host === new URL(env.NEXT_PUBLIC_SUPABASE_URL).host;
  } catch {
    return false;
  }
}

// Lit les dimensions d'une image déjà déposée dans notre Storage (upload direct
// depuis le navigateur — le serveur n'a jamais vu le binaire). Lecture partielle
// d'abord, fichier complet en repli. Ne lève jamais : sans dimensions, la
// galerie retombe sur un ratio 4:3. Restreint à notre propre domaine Supabase,
// l'URL venant du client.
export async function readImageDimensions(url: string): Promise<ImageDimensions | null> {
  if (!isOwnStorageUrl(url)) return null;
  try {
    const partial = await fetch(url, {
      headers: { Range: `bytes=0-${DIMENSIONS_PROBE_BYTES - 1}` },
      cache: "no-store",
    });
    if (partial.ok) {
      try {
        const dims = dimensionsFromBytes(new Uint8Array(await partial.arrayBuffer()));
        if (dims) return dims;
      } catch {
        // En-tête au-delà des premiers Ko : on retente avec le fichier complet.
      }
    }
    const full = await fetch(url, { cache: "no-store" });
    if (!full.ok) return null;
    return dimensionsFromBytes(new Uint8Array(await full.arrayBuffer()));
  } catch (error) {
    logger.warn("media.dimensions.failed", { url, error: error instanceof Error ? error.message : String(error) });
    return null;
  }
}
