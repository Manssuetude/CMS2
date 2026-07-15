import type { CSSProperties } from "react";
import type { ImageCrop } from "@/types/cms";

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function clampPercent(value: number): number {
  if (value < 0) return 0;
  if (value > 100) return 100;
  return value;
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
 * Style CSS à appliquer sur le `<img>` (qui doit rester en `object-fit: cover`) pour
 * reproduire le recadrage : point focal via `object-position`, zoom via la propriété
 * CSS `scale` (indépendante de `transform`, donc sans conflit avec un effet de survol).
 * Le même style est utilisé côté public ET dans l'aperçu admin → rendu cohérent.
 * Sans crop → objet vide (le comportement `object-fit: cover` centré par défaut s'applique).
 */
export function cropToImageStyle(crop: ImageCrop | null | undefined): CSSProperties {
  if (!crop) return {};
  const cx = clampPercent(crop.x + crop.width / 2);
  const cy = clampPercent(crop.y + crop.height / 2);
  const style: CSSProperties = {
    objectPosition: `${cx.toFixed(3)}% ${cy.toFixed(3)}%`,
  };
  if (crop.zoom && crop.zoom !== 1) {
    style.scale = String(crop.zoom);
    style.transformOrigin = `${cx.toFixed(3)}% ${cy.toFixed(3)}%`;
  }
  return style;
}
