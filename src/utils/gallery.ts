import type { GalleryPhoto } from "@/types/cms";

// Galerie photo publique (PhotoGallery) — préparation pure des photos, sans
// dépendance au DOM : ratio d'affichage, texte alternatif, découpage visible/reste.

export const GALLERY_FALLBACK_RATIO = 4 / 3;
export const GALLERY_VISIBLE_LIMIT = 12;

// Bornes du ratio affiché : un visuel très étiré (bannière, capture d'écran
// verticale) écraserait sinon le reste de sa ligne.
const MIN_RATIO = 0.5;
const MAX_RATIO = 2.5;

export type PreparedPhoto = GalleryPhoto & {
  ratio: number;
  resolvedAlt: string;
};

export function photoRatio(width: number | null | undefined, height: number | null | undefined): number {
  if (!width || !height || width <= 0 || height <= 0) return GALLERY_FALLBACK_RATIO;
  return Math.min(MAX_RATIO, Math.max(MIN_RATIO, width / height));
}

// À l'upload, l'alt est prérempli avec le nom du fichier (« IMG_6740.JPG ») :
// un tel alt n'apporte rien à un lecteur d'écran, on le traite comme absent.
export function isMeaningfulAlt(alt: string | null | undefined): alt is string {
  const value = alt?.trim();
  if (!value) return false;
  if (/\.(jpe?g|png|webp|gif|avif|heic|heif|tiff?|bmp|svg)$/i.test(value)) return false;
  if (/^(img|dsc|pxl|dscn|photo|image)[-_ ]?\d+$/i.test(value)) return false;
  return true;
}

export function resolvePhotoAlt(alt: string | null | undefined, title: string, index: number): string {
  return isMeaningfulAlt(alt) ? alt.trim() : `${title}, photo ${index + 1}`;
}

export function preparePhotos(photos: GalleryPhoto[], title: string): PreparedPhoto[] {
  return photos.map((photo, index) => ({
    ...photo,
    ratio: photoRatio(photo.width, photo.height),
    resolvedAlt: resolvePhotoAlt(photo.alt, title, index),
  }));
}

export function splitVisible<T>(items: T[], limit = GALLERY_VISIBLE_LIMIT): { visible: T[]; hiddenCount: number } {
  return { visible: items.slice(0, limit), hiddenCount: Math.max(0, items.length - limit) };
}

export function photoCountLabel(count: number): string {
  return `${count} photo${count > 1 ? "s" : ""}`;
}
