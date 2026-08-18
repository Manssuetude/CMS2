// Consentement cookies/RGPD — stocké en localStorage, jamais côté serveur
// (pas de cookie technique nécessaire juste pour retenir le choix).
export const CONSENT_STORAGE_KEY = "ms-cookie-consent";

export type ConsentValue = "accepted" | "declined";

export function readStoredConsent(): ConsentValue | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(CONSENT_STORAGE_KEY);
  return value === "accepted" || value === "declined" ? value : null;
}

export const CONSENT_CHANGE_EVENT = "ms-consent-change";

export function writeStoredConsent(value: ConsentValue): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CONSENT_STORAGE_KEY, value);
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGE_EVENT, { detail: value }));
}
