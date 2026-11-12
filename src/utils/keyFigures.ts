import type { KeyFigure, KeyFigures } from "@/types/cms";
import { DEFAULT_KEY_FIGURES, KEY_FIGURES_MAX, KEY_FIGURES_MIN } from "@/constants/keyFigures";

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function cleanItems(value: unknown): KeyFigure[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      const record = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
      return { value: str(record.value), label: str(record.label) };
    })
    .filter((item) => item.value && item.label)
    .slice(0, KEY_FIGURES_MAX);
}

/**
 * Lecture défensive de `homepage_config.keyFigures`. Absent ou incomplet
 * (moins de 2 chiffres) → valeurs par défaut.
 */
export function parseKeyFigures(value: unknown): KeyFigures {
  const record = value && typeof value === "object" ? (value as Record<string, unknown>) : null;
  if (!record) return DEFAULT_KEY_FIGURES;
  const items = cleanItems(record.items);
  return {
    eyebrow: str(record.eyebrow) || DEFAULT_KEY_FIGURES.eyebrow,
    title: str(record.title) || DEFAULT_KEY_FIGURES.title,
    items: items.length >= KEY_FIGURES_MIN ? items : DEFAULT_KEY_FIGURES.items,
  };
}

/** Saisie du formulaire admin (`keyFigureValue0`, `keyFigureLabel0`…) ; null si moins de 2 chiffres. */
export function readKeyFiguresForm(form: { get(name: string): unknown }): KeyFigures | null {
  const items = cleanItems(
    Array.from({ length: KEY_FIGURES_MAX }, (_, i) => ({
      value: form.get(`keyFigureValue${i}`),
      label: form.get(`keyFigureLabel${i}`),
    })),
  );
  if (items.length < KEY_FIGURES_MIN) return null;
  return {
    eyebrow: str(form.get("keyFiguresEyebrow")) || DEFAULT_KEY_FIGURES.eyebrow,
    title: str(form.get("keyFiguresTitle")) || DEFAULT_KEY_FIGURES.title,
    items,
  };
}
