// Textes SEO (titres, meta descriptions) — fonctions pures, testées
// (tests/seoText.test.ts). Utilisées par lib/seo.ts.

export const META_DESCRIPTION_MIN = 140;
export const META_DESCRIPTION_MAX = 160;

// Le suffixe « | Manssuétude » est ajouté une seule fois par le gabarit de titre
// du layout racine. Les titres saisis en base (« Productions - Manssuétude ») ou
// écrits en dur (« Contact · Manssuétude ») le doublaient : on le retire ici.
export function stripBrandSuffix(title: string): string {
  return title.replace(/\s*[-–—·|:]\s*Manss[uü][ée]tude\s*$/i, "").trim();
}

function normalizeSpaces(text: string): string {
  return text
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Tronque proprement à 160 caractères maximum, sur une fin de mot.
export function toMetaDescription(input: string): string {
  const text = normalizeSpaces(input);
  if (text.length <= META_DESCRIPTION_MAX) return text;
  const cut = text.slice(0, META_DESCRIPTION_MAX - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 100 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.–-]+$/, "")}…`;
}

function withFinalPeriod(text: string): string {
  return /[.!?…»"]$/.test(text) ? text : `${text}.`;
}

// Description d'une fiche : le texte de l'équipe, complété par des phrases
// factuelles (date, lieu, thème…) tant qu'il reste sous 140 caractères et que
// l'ajout ne dépasse pas 160. Jamais de contenu inventé : uniquement les
// compléments fournis par l'appelant.
export function completeDescription(base: string | null | undefined, complements: Array<string | null | undefined>) {
  let text = normalizeSpaces(base ?? "");
  for (const raw of complements) {
    if (text.length >= META_DESCRIPTION_MIN) break;
    const complement = raw ? normalizeSpaces(raw) : "";
    if (!complement) continue;
    const candidate = text ? `${withFinalPeriod(text)} ${complement}` : complement;
    if (candidate.length <= META_DESCRIPTION_MAX) text = candidate;
  }
  return toMetaDescription(text);
}

export function formatDateFr(date: string | null | undefined): string | null {
  if (!date) return null;
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

// Titre d'Article pour les données structurées : Google recommande 110
// caractères maximum (coupé sur un mot).
export function toHeadline(title: string, max = 110): string {
  const text = normalizeSpaces(title);
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 60 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.–-]+$/, "")}…`;
}

// Date + heure locales (saisies en heure de Paris dans l'admin) → ISO 8601 avec
// décalage horaire explicite (+01:00 l'hiver, +02:00 l'été), recommandé par
// Google pour startDate/endDate d'un Event. Sans heure : la date seule.
export function toParisIsoDateTime(date: string | null | undefined, time: string | null | undefined): string | null {
  if (!date) return null;
  if (!time) return date;
  const hhmm = time.slice(0, 5);
  const probe = new Date(`${date}T${hhmm}:00Z`);
  if (Number.isNaN(probe.getTime())) return date;
  const offsetLabel =
    new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Paris", timeZoneName: "shortOffset" })
      .formatToParts(probe)
      .find((part) => part.type === "timeZoneName")?.value ?? "GMT+1";
  const match = offsetLabel.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
  const offset = match ? `${match[1]}${match[2].padStart(2, "0")}:${match[3] ?? "00"}` : "+01:00";
  return `${date}T${hhmm}:00${offset}`;
}
