import type { ReactNode } from "react";

// Protocole postMessage entre une fiche admin (PagePreviewModal) et la page
// d'aperçu chargée dans l'iframe (PagePreviewFrame). Même origine
// uniquement, vérifiée des deux côtés. Partagé par les aperçus d'événement et
// de production.

export const EVENT_PREVIEW_PATH = "/apercu/evenement";
export const PRODUCTION_PREVIEW_PATH = "/apercu/production";

export const PREVIEW_READY = "page-preview-ready";
export const PREVIEW_DATA = "page-preview-data";
/** L'iframe demande d'afficher une autre partie (clic sur un lien de partie). */
export const PREVIEW_NAVIGATE = "page-preview-navigate";

export type PreviewTheme = "light" | "dark";

export type PreviewDataMessage = {
  type: typeof PREVIEW_DATA;
  // Valeurs texte du formulaire (mêmes noms de champs que l'enregistrement),
  // complétées par la fiche (style d'en-tête, partie affichée, texte importé…).
  payload: Record<string, string>;
  theme: PreviewTheme;
};

export type PreviewNavigateMessage = { type: typeof PREVIEW_NAVIGATE; index: number };

/**
 * Résultat d'un rendu d'aperçu (server action). `links` : chemins publics
 * interceptés dans l'iframe ; un clic sur l'un d'eux renvoie son index à la
 * fiche (PREVIEW_NAVIGATE) au lieu de quitter l'aperçu.
 */
export type PreviewResult = { ok: true; node: ReactNode; links?: string[] } | { ok: false; error: string };
