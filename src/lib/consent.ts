// Consentement cookies/RGPD — stocké en localStorage, jamais côté serveur
// (pas de cookie technique nécessaire juste pour retenir le choix).
export const CONSENT_STORAGE_KEY = "ms-cookie-consent";

export type ConsentValue = "accepted" | "declined";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function readStoredConsent(): ConsentValue | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(CONSENT_STORAGE_KEY);
  return value === "accepted" || value === "declined" ? value : null;
}

export const CONSENT_CHANGE_EVENT = "ms-consent-change";

// Répercute le choix du visiteur sur Google Consent Mode (voir consentDefaultScript
// dans app/layout.tsx, qui pose les signaux par défaut "denied" avant même ce choix).
function updateGtagConsent(value: ConsentValue): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  const state = value === "accepted" ? "granted" : "denied";
  window.gtag("consent", "update", {
    ad_storage: state,
    ad_user_data: state,
    ad_personalization: state,
    analytics_storage: state,
  });
}

export function writeStoredConsent(value: ConsentValue): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CONSENT_STORAGE_KEY, value);
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGE_EVENT, { detail: value }));
  updateGtagConsent(value);
}
