// Consentement cookies/RGPD — stocké en localStorage, jamais côté serveur
// (pas de cookie technique nécessaire juste pour retenir le choix).
//
// Google Analytics est en Consent Mode « basique » : gtag.js n'est injecté
// qu'après un clic sur « Accepter » (voir GoogleAnalytics.tsx, rendu dans
// ConsentGate). Avant cela, et après un refus, aucune requête ne part vers
// Google. Le choix est horodaté et redemandé au bout de 6 mois (CNIL).
export const CONSENT_STORAGE_KEY = "ms-cookie-consent";
export const GA_MEASUREMENT_ID = "G-5TJZEVV0G9";

// Durée de validité du choix (accepter comme refuser) : 6 mois, recommandation CNIL.
export const CONSENT_MAX_AGE_DAYS = 182;

export type ConsentValue = "accepted" | "declined";
export type StoredConsent = { value: ConsentValue; date: string };

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

// Lit le choix stocké : null si absent, illisible, au format historique (simple
// chaîne sans date — on ne sait pas quand il a été donné) ou expiré.
export function parseStoredConsent(raw: string | null, now: Date = new Date()): StoredConsent | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<StoredConsent>;
    if (parsed.value !== "accepted" && parsed.value !== "declined") return null;
    const date = new Date(parsed.date ?? "");
    if (Number.isNaN(date.getTime())) return null;
    const ageDays = (now.getTime() - date.getTime()) / 86_400_000;
    if (ageDays < 0 || ageDays > CONSENT_MAX_AGE_DAYS) return null;
    return { value: parsed.value, date: date.toISOString() };
  } catch {
    return null;
  }
}

export function readStoredConsent(): ConsentValue | null {
  if (typeof window === "undefined") return null;
  try {
    return parseStoredConsent(window.localStorage.getItem(CONSENT_STORAGE_KEY))?.value ?? null;
  } catch {
    return null;
  }
}

export const CONSENT_CHANGE_EVENT = "ms-consent-change";
// Réouverture du bandeau depuis le lien « Gérer les cookies » du pied de page.
export const CONSENT_OPEN_EVENT = "ms-consent-open";

// Noms des cookies Google Analytics présents dans document.cookie (_ga, _ga_XXXX…).
export function gaCookieNames(cookieHeader: string): string[] {
  return cookieHeader
    .split(";")
    .map((part) => part.split("=")[0]?.trim() ?? "")
    .filter((name) => name === "_ga" || name.startsWith("_ga_") || name === "_gid" || name === "_gat");
}

// Domaines sur lesquels GA a pu poser ses cookies : l'hôte exact et ses domaines
// parents (GA écrit par défaut sur le domaine racine, ex. .manssuetude.com).
export function cookieDomainCandidates(hostname: string): string[] {
  const parts = hostname.split(".");
  const candidates = [""];
  for (let i = 0; i < parts.length - 1; i += 1) candidates.push(`.${parts.slice(i).join(".")}`);
  return candidates;
}

function deleteGaCookies(): void {
  const expires = "Thu, 01 Jan 1970 00:00:00 GMT";
  for (const name of gaCookieNames(document.cookie)) {
    for (const domain of cookieDomainCandidates(window.location.hostname)) {
      document.cookie = `${name}=; expires=${expires}; path=/${domain ? `; domain=${domain}` : ""}`;
    }
  }
}

// Retrait du consentement après coup : gtag.js est déjà chargé dans la page,
// on le neutralise (plus aucun envoi) et on efface ses cookies.
function revokeAnalytics(): void {
  (window as unknown as Record<string, boolean>)[`ga-disable-${GA_MEASUREMENT_ID}`] = true;
  if (typeof window.gtag === "function") {
    window.gtag("consent", "update", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "denied",
    });
  }
  deleteGaCookies();
}

export function writeStoredConsent(value: ConsentValue): void {
  if (typeof window === "undefined") return;
  const stored: StoredConsent = { value, date: new Date().toISOString() };
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // Stockage indisponible (navigation privée stricte) : le choix vaut pour la page en cours.
  }
  if (value === "declined") revokeAnalytics();
  else (window as unknown as Record<string, boolean>)[`ga-disable-${GA_MEASUREMENT_ID}`] = false;
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGE_EVENT, { detail: value }));
}

export function openConsentBanner(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CONSENT_OPEN_EVENT));
}
