import type { Announcement, AnnouncementState, ImageCrop } from "@/types/cms";
import { parseImageCrop } from "@/utils/imageCrop";

// Logique pure des annonces mises en avant (aucun accès base) : partagée par le
// service (sélection de l'annonce en ligne), l'admin (statuts, validation,
// chevauchements) et le rendu public (dates, liens). Testée dans
// tests/announcements.test.ts.

export const ANNOUNCEMENT_TIME_ZONE = "Europe/Paris";

// ── Dates ────────────────────────────────────────────────────────────────────

function toTime(value: string | null | undefined): number | null {
  if (!value) return null;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : time;
}

// Écart (ms) entre l'heure de Paris et UTC à un instant donné (heure d'été comprise).
function parisOffset(time: number): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: ANNOUNCEMENT_TIME_ZONE,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(time));
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return asUtc - Math.floor(time / 1000) * 1000;
}

/**
 * Valeur d'un champ `datetime-local` saisie à l'heure de Paris ("2026-12-31T23:59")
 * → ISO UTC. Chaîne vide ou invalide → null.
 */
export function parisLocalToIso(value: string | null | undefined): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec((value ?? "").trim());
  if (!match) return null;
  const [, y, mo, d, h, mi] = match.map(Number);
  const guess = Date.UTC(y, mo - 1, d, h, mi);
  let result = guess - parisOffset(guess);
  // Changement d'heure : l'écart au résultat peut différer de celui de l'estimation.
  const corrected = guess - parisOffset(result);
  if (corrected !== result) result = corrected;
  return new Date(result).toISOString();
}

/** ISO → valeur de champ `datetime-local` à l'heure de Paris (vide si absent). */
export function isoToParisLocal(iso: string | null | undefined): string {
  const time = toTime(iso);
  if (time === null) return "";
  const local = new Date(time + parisOffset(time)).toISOString();
  return local.slice(0, 16);
}

function frenchDate(time: number): string {
  const label = new Date(time).toLocaleDateString("fr-FR", {
    timeZone: ANNOUNCEMENT_TIME_ZONE,
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return label.replace(/^1 /, "1er ");
}

/** « 31 décembre 2026 » (heure de Paris). */
export function formatParisDate(iso: string | null | undefined): string | null {
  const time = toTime(iso);
  return time === null ? null : frenchDate(time);
}

/**
 * Date de clôture affichée. `ends_at` est exclusif : une fin saisie à minuit pile
 * (1er janvier 00:00) se lit « clôture le 31 décembre ».
 */
export function formatDeadline(endsAt: string | null | undefined): string | null {
  const time = toTime(endsAt);
  return time === null ? null : frenchDate(time - 1000);
}

/** « 31 décembre 2026 à 23 h 59 » (heure de Paris), pour l'admin. */
export function formatParisDateTime(iso: string | null | undefined): string | null {
  const time = toTime(iso);
  if (time === null) return null;
  const hour = new Date(time).toLocaleTimeString("fr-FR", {
    timeZone: ANNOUNCEMENT_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${frenchDate(time)} à ${hour.replace(":", " h ")}`;
}

/** Remplace le jeton `{date}` par la date de clôture (bandeau, sous-titre…). */
export function fillDateToken(text: string | null | undefined, endsAt: string | null | undefined): string {
  const value = text ?? "";
  if (!value.includes("{date}")) return value;
  return value.replaceAll("{date}", formatDeadline(endsAt) ?? "la date de clôture");
}

// ── Statut et sélection ──────────────────────────────────────────────────────

type Schedulable = Pick<Announcement, "id" | "enabled" | "startsAt" | "endsAt"> & { updatedAt?: string };

export function announcementState(item: Schedulable, now: Date): AnnouncementState {
  if (!item.enabled) return "disabled";
  const start = toTime(item.startsAt);
  const end = toTime(item.endsAt);
  if (start === null || end === null) return "undated";
  const t = now.getTime();
  if (t < start) return "scheduled";
  if (t >= end) return "ended";
  return "live";
}

/** En ligne : activée et `starts_at <= now < ends_at` (dates obligatoires). */
export function isAnnouncementLive(item: Schedulable, now: Date): boolean {
  return announcementState(item, now) === "live";
}

/**
 * Annonce en ligne à l'instant `now`. Plusieurs en même temps : la plus
 * récemment démarrée gagne (à égalité, la dernière modifiée).
 */
export function pickLiveAnnouncement<T extends Schedulable>(items: T[], now: Date): T | null {
  const live = items.filter((item) => isAnnouncementLive(item, now));
  live.sort((a, b) => {
    const byStart = (toTime(b.startsAt) ?? 0) - (toTime(a.startsAt) ?? 0);
    if (byStart !== 0) return byStart;
    return (toTime(b.updatedAt) ?? 0) - (toTime(a.updatedAt) ?? 0);
  });
  return live[0] ?? null;
}

/** Libellé de statut pour la liste admin. */
export function announcementStatusLabel(item: Schedulable, now: Date): string {
  switch (announcementState(item, now)) {
    case "live":
      return `En ligne jusqu'au ${formatParisDateTime(item.endsAt)}`;
    case "scheduled":
      return `Programmée le ${formatParisDateTime(item.startsAt)}`;
    case "ended":
      return "Terminée";
    case "disabled":
      return "Désactivée";
    default:
      return "Dates à définir";
  }
}

/** Autres annonces activées dont la période recoupe celle de `target`. */
export function findOverlaps<T extends Schedulable>(target: Schedulable, others: T[]): T[] {
  const start = toTime(target.startsAt);
  const end = toTime(target.endsAt);
  if (start === null || end === null) return [];
  return others.filter((other) => {
    if (other.id === target.id || !other.enabled) return false;
    const oStart = toTime(other.startsAt);
    const oEnd = toTime(other.endsAt);
    if (oStart === null || oEnd === null) return false;
    return start < oEnd && oStart < end;
  });
}

// ── Liens ────────────────────────────────────────────────────────────────────

const INTERNAL_HOSTS = new Set(["manssuetude.com", "www.manssuetude.com"]);

/** Lien qui sort du site (http… hors manssuetude.com) → nouvel onglet. */
export function isExternalUrl(url: string | null | undefined): boolean {
  const value = (url ?? "").trim();
  if (!/^https?:\/\//i.test(value)) return false;
  try {
    return !INTERNAL_HOSTS.has(new URL(value).hostname.toLowerCase());
  } catch {
    return true;
  }
}

/** Chemin interne (/nous-rejoindre, #candidater) ou URL http(s) complète. */
export function isValidLinkUrl(url: string): boolean {
  const value = url.trim();
  if (/^\/(?!\/)/.test(value) || /^#[\w-]+$/.test(value)) return !/\s/.test(value);
  if (!/^https?:\/\//i.test(value)) return false;
  try {
    return Boolean(new URL(value).hostname.includes("."));
  } catch {
    return false;
  }
}

/** Chemin d'une URL interne (absolue manssuetude.com ou relative), sans requête ni ancre. */
export function internalPath(url: string | null | undefined): string | null {
  const value = (url ?? "").trim();
  if (!value) return null;
  if (value.startsWith("/")) return value.split(/[?#]/)[0] || "/";
  if (/^https?:\/\//i.test(value) && !isExternalUrl(value)) {
    try {
      return new URL(value).pathname || "/";
    } catch {
      return null;
    }
  }
  return null;
}

// ── Formulaire admin ─────────────────────────────────────────────────────────

export type AnnouncementInput = Omit<
  Announcement,
  "id" | "imageUrl" | "imageAlt" | "imageWidth" | "imageHeight" | "createdAt" | "updatedAt"
>;

const TEXT_FIELDS = [
  "bannerLabel",
  "bannerText",
  "bannerLinkLabel",
  "bannerLinkUrl",
  "eyebrow",
  "title",
  "titleAccent",
  "subtitle",
  "imageId",
  "primaryCtaLabel",
  "primaryCtaUrl",
  "secondaryCtaLabel",
  "secondaryCtaUrl",
  "periodLabel",
  "finalEyebrow",
  "finalTitle",
  "finalText",
  "finalCtaLabel",
  "finalCtaUrl",
  "headerBadge",
  "seoTitle",
  "seoDescription",
] as const;

const BOOLEAN_FIELDS = [
  "enabled",
  "bannerEnabled",
  "heroEnabled",
  "showDeadline",
  "showKeyFigures",
  "finalEnabled",
  "appliesToJoinPage",
] as const;

const URL_FIELDS: { key: keyof AnnouncementInput; label: string }[] = [
  { key: "bannerLinkUrl", label: "lien du bandeau" },
  { key: "primaryCtaUrl", label: "bouton principal" },
  { key: "secondaryCtaUrl", label: "bouton secondaire" },
  { key: "finalCtaUrl", label: "bouton du bloc final" },
];

type FormLike = { get(name: string): unknown };

function text(form: FormLike, name: string): string | null {
  const value = form.get(name);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

/** Lecture du formulaire /admin/annonces (champs nommés comme les clés camelCase). */
export function readAnnouncementForm(form: FormLike): AnnouncementInput {
  const texts = Object.fromEntries(TEXT_FIELDS.map((key) => [key, text(form, key)])) as Record<
    (typeof TEXT_FIELDS)[number],
    string | null
  >;
  const booleans = Object.fromEntries(BOOLEAN_FIELDS.map((key) => [key, form.get(key) === "on"])) as Record<
    (typeof BOOLEAN_FIELDS)[number],
    boolean
  >;
  const imageCrop: ImageCrop | null = texts.imageId ? parseImageCrop(form.get("imageCrop")) : null;
  return {
    name: text(form, "name") ?? "",
    startsAt: parisLocalToIso(text(form, "startsAt")),
    endsAt: parisLocalToIso(text(form, "endsAt")),
    ...texts,
    ...booleans,
    imageCrop,
  };
}

/** Message d'erreur (le premier rencontré) ou null si la saisie est valide. */
export function validateAnnouncement(input: AnnouncementInput): string | null {
  if (!input.name.trim()) return "Le nom interne est obligatoire.";
  const start = toTime(input.startsAt);
  const end = toTime(input.endsAt);
  if (start !== null && end !== null && end <= start) return "La date de fin doit être après la date de début.";
  if (input.enabled && (start === null || end === null)) {
    return "Renseignez les dates de début et de fin pour activer l'annonce.";
  }
  for (const { key, label } of URL_FIELDS) {
    const value = input[key];
    if (typeof value === "string" && value && !isValidLinkUrl(value)) {
      return `Le lien du ${label} n'est pas valide (ex. /nous-rejoindre ou https://…).`;
    }
  }
  if (input.heroEnabled && !input.title) return "Le titre est obligatoire quand le hero est activé.";
  if (input.bannerEnabled && !input.bannerLabel && !input.bannerText) {
    return "Le bandeau activé doit avoir un libellé ou un texte.";
  }
  if (input.finalEnabled && !input.finalTitle) return "Le titre du bloc final est obligatoire quand il est activé.";
  return null;
}

/** Copie réutilisable d'une annonce : désactivée, dates vidées. */
export function duplicateAnnouncement(item: Announcement): AnnouncementInput {
  const {
    id: _id,
    imageUrl: _url,
    imageAlt: _alt,
    imageWidth: _w,
    imageHeight: _h,
    createdAt: _c,
    updatedAt: _u,
    ...rest
  } = item;
  return { ...rest, name: `Copie de ${item.name}`, enabled: false, startsAt: null, endsAt: null };
}

// ── Rendu ────────────────────────────────────────────────────────────────────

/** SEO de /nous-rejoindre pendant l'annonce (ex. « Manssuétude recrute | Candidatures ouvertes »). */
export function announcementSeo(item: Announcement): { title: string; description: string | null } {
  const headline = [item.title, item.titleAccent]
    .filter(Boolean)
    .join(" ")
    .trim()
    .replace(/[.\s]+$/, "");
  const label = item.bannerLabel || item.eyebrow;
  const derived = [headline, label].filter(Boolean).join(" | ");
  return {
    title: item.seoTitle || derived || item.name,
    description: item.seoDescription || fillDateToken(item.subtitle, item.endsAt) || null,
  };
}
