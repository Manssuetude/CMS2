import { getSupabaseAdmin } from "@/lib/db";
import { validateUpload } from "@/utils/uploadValidation";
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

export async function uploadToStorage(file: File, folder = "media") {
  validateUpload(file);
  const db = getSupabaseAdmin();
  const path = `${folder}/${Date.now()}-${file.name}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  const { error } = await db.storage.from("manssuetude-media").upload(path, bytes, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw error;
  const { data } = db.storage.from("manssuetude-media").getPublicUrl(path);
  return { path, url: data.publicUrl };
}
