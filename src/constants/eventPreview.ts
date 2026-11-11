// Protocole postMessage entre le formulaire admin (EventPreviewModal) et la
// page d'aperçu chargée dans l'iframe (EventPreviewFrame). Même origine
// uniquement — vérifiée des deux côtés.

export const EVENT_PREVIEW_PATH = "/apercu/evenement";
export const EVENT_PREVIEW_READY = "event-preview-ready";
export const EVENT_PREVIEW_DATA = "event-preview-data";

export type PreviewTheme = "light" | "dark";

export type EventPreviewMessage = {
  type: typeof EVENT_PREVIEW_DATA;
  // Valeurs texte du formulaire (mêmes noms de champs que l'enregistrement).
  payload: Record<string, string>;
  theme: PreviewTheme;
};
