import { getSupabaseAdmin } from "@/lib/db";
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
