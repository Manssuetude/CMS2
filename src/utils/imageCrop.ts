import type { CSSProperties } from "react";
import type { ImageCrop } from "@/types/cms";

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/**
 * Parse défensif du JSONB `image_crop` (venu de la base ou d'un champ de formulaire).
 * Retourne null si la valeur est absente, mal formée ou incomplète.
 */
export function parseImageCrop(value: unknown): ImageCrop | null {
  let raw: unknown = value;
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    try {
      raw = JSON.parse(trimmed);
    } catch {
      return null;
    }
  }
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;
  const { x, y, width, height } = record;
  if (!isFiniteNumber(x) || !isFiniteNumber(y) || !isFiniteNumber(width) || !isFiniteNumber(height)) {
    return null;
  }
  if (width <= 0 || height <= 0) return null;
  const zoom = isFiniteNumber(record.zoom) && record.zoom > 0 ? record.zoom : 1;
  return { x, y, width, height, zoom };
}

/**
 * Style CSS à appliquer sur le `<img>` pour reproduire **exactement** le rectangle de
 * recadrage choisi dans `react-easy-crop` (croppedAreaPercentages : x, y, width, height
 * en % de l'image d'origine). L'image est agrandie et décalée en position absolue pour
 * que ce rectangle remplisse précisément le conteneur (WYSIWYG fidèle, y compris zoomé).
 *
 * Conditions côté conteneur (voir styles) : `position: relative; overflow: hidden` et un
 * `aspect-ratio` identique à celui du recadrage (constants/imageAspects.ts). Le conteneur
 * porte le ratio ; l'image est positionnée dedans.
 *
 * Le même style est utilisé côté public ET dans l'aperçu admin → rendu identique à la modale.
 * Sans crop → objet vide (le `object-fit: cover` par défaut du conteneur s'applique).
 *
 * Démonstration : si le recadrage prend `width` % de la largeur d'origine, l'image doit
 * mesurer `100 / width` fois la largeur du conteneur ; son bord gauche recule de `x` % de
 * cette largeur d'image. La boîte résultante a exactement le ratio naturel de l'image, donc
 * pas de déformation. Idem en vertical avec `height` / `y`.
 */
export function cropToImageStyle(crop: ImageCrop | null | undefined): CSSProperties {
  if (!crop) return {};
  return {
    position: "absolute",
    width: `${(10000 / crop.width).toFixed(3)}%`,
    height: `${(10000 / crop.height).toFixed(3)}%`,
    left: `${(-(crop.x / crop.width) * 100).toFixed(3)}%`,
    top: `${(-(crop.y / crop.height) * 100).toFixed(3)}%`,
    maxWidth: "none",
  };
}
