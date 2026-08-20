import { AppError } from "@/lib/errors";

const ALLOWED_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "svg",
  "mp4",
  "mov",
  "webm",
  "mp3",
  "wav",
  "m4a",
  "pdf",
  "zip",
];

// Préfixe MIME attendu par extension — vérification de cohérence légère (le
// contentType déclaré par le navigateur n'est jamais fiable à 100 %, mais un
// écart flagrant, ex. un .jpg déclaré application/x-executable, est rejeté).
const MIME_PREFIX_BY_EXTENSION: Record<string, string[]> = {
  jpg: ["image/"],
  jpeg: ["image/"],
  png: ["image/"],
  webp: ["image/"],
  svg: ["image/"],
  mp4: ["video/"],
  mov: ["video/"],
  webm: ["video/"],
  mp3: ["audio/"],
  wav: ["audio/"],
  m4a: ["audio/"],
  pdf: ["application/pdf"],
  zip: ["application/zip", "application/x-zip-compressed", "application/octet-stream"],
};

export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024; // 50 Mo

export function validateUpload(file: File): void {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    throw new AppError(`Type de fichier non autorisé (.${ext || "?"}).`, 400, "UPLOAD_TYPE_NOT_ALLOWED");
  }
  const allowedPrefixes = MIME_PREFIX_BY_EXTENSION[ext] ?? [];
  if (file.type && !allowedPrefixes.some((prefix) => file.type.startsWith(prefix))) {
    throw new AppError("Le type de fichier déclaré ne correspond pas à son extension.", 400, "UPLOAD_TYPE_MISMATCH");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new AppError(
      `Fichier trop volumineux (${Math.round(file.size / 1024 / 1024)} Mo, max 50 Mo).`,
      400,
      "UPLOAD_TOO_LARGE",
    );
  }
}
