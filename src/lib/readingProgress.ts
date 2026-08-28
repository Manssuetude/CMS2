// Reprise de lecture pour les productions — stockée en localStorage (confort
// de lecture par appareil, jamais envoyée au serveur, aucun cookie nécessaire).
const SCROLL_PREFIX = "ms-reading-progress:";
const PDF_PAGE_PREFIX = "ms-pdf-page:";

export function readSavedScrollProgress(slug: string): number | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SCROLL_PREFIX + slug);
  const value = raw ? Number(raw) : NaN;
  return Number.isFinite(value) && value > 0 && value < 100 ? value : null;
}

export function saveScrollProgress(slug: string, percent: number): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SCROLL_PREFIX + slug, String(Math.round(percent)));
}

export function readSavedPdfPage(slug: string): number | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(PDF_PAGE_PREFIX + slug);
  const value = raw ? Number(raw) : NaN;
  return Number.isFinite(value) && value > 1 ? value : null;
}

export function savePdfPage(slug: string, page: number): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PDF_PAGE_PREFIX + slug, String(page));
}
