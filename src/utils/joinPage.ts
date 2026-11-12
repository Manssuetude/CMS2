import type { Announcement, JoinPageContent, Page, SlotPhoto } from "@/types/cms";
import {
  DEFAULT_JOIN_CONTENT,
  JOIN_AMBITION_COUNT,
  JOIN_EXPERIENCE_COUNT,
  JOIN_FALLBACK,
  JOIN_STEPS_COUNT,
} from "@/constants/joinPage";
import { parseImageCrop } from "@/utils/imageCrop";
import { formatDeadline, fillDateToken } from "@/utils/announcements";

// Contenu de /nous-rejoindre : lecture défensive de `pages.content` (clés
// absentes → textes par défaut), lecture du formulaire admin, et valeurs
// affichées selon qu'une annonce s'applique ou non. Pur, testé dans
// tests/joinPage.test.ts.

type Rec = Record<string, unknown>;

function rec(value: unknown): Rec {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Rec) : {};
}

function str(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function photo(value: unknown, fallback: SlotPhoto): SlotPhoto {
  const record = rec(value);
  const imageId = typeof record.imageId === "string" && record.imageId.trim() ? record.imageId.trim() : null;
  return {
    imageId,
    crop: imageId ? parseImageCrop(record.crop) : null,
    alt: str(record.alt, fallback.alt),
  };
}

// Nombre d'éléments fixe : la mise en page ne dépend jamais du contenu saisi.
function fixed<T>(value: unknown, defaults: T[], count: number, map: (item: unknown, fallback: T) => T): T[] {
  const list = Array.isArray(value) ? value : [];
  return Array.from({ length: count }, (_, i) => map(list[i], defaults[i]));
}

export function parseJoinPageContent(value: unknown): JoinPageContent {
  const raw = rec(value);
  const d = DEFAULT_JOIN_CONTENT;
  const start = rec(raw.start);
  const experience = rec(raw.experience);
  const ambition = rec(raw.ambition);
  const audience = rec(raw.audience);
  const steps = rec(raw.steps);
  const final = rec(raw.final);
  const qualities = Array.isArray(audience.qualities)
    ? audience.qualities.filter((q): q is string => typeof q === "string" && Boolean(q.trim())).map((q) => q.trim())
    : [];
  return {
    heroSubtitle: str(raw.heroSubtitle, d.heroSubtitle),
    heroAlt: str(raw.heroAlt, d.heroAlt),
    start: {
      eyebrow: str(start.eyebrow, d.start.eyebrow),
      title: str(start.title, d.start.title),
      text: str(start.text, d.start.text),
      photo: photo(start.photo, d.start.photo),
    },
    experience: {
      eyebrow: str(experience.eyebrow, d.experience.eyebrow),
      title: str(experience.title, d.experience.title),
      text: str(experience.text, d.experience.text),
      items: fixed(experience.items, d.experience.items, JOIN_EXPERIENCE_COUNT, (item, fb) => ({
        label: str(rec(item).label, fb.label),
        photo: photo(rec(item).photo, fb.photo),
      })),
    },
    ambition: {
      eyebrow: str(ambition.eyebrow, d.ambition.eyebrow),
      title: str(ambition.title, d.ambition.title),
      text: str(ambition.text, d.ambition.text),
      items: fixed(ambition.items, d.ambition.items, JOIN_AMBITION_COUNT, (item, fb) => ({
        title: str(rec(item).title, fb.title),
        text: str(rec(item).text, fb.text),
      })),
    },
    audience: {
      eyebrow: str(audience.eyebrow, d.audience.eyebrow),
      title: str(audience.title, d.audience.title),
      whoTitle: str(audience.whoTitle, d.audience.whoTitle),
      whoText: str(audience.whoText, d.audience.whoText),
      expectTitle: str(audience.expectTitle, d.audience.expectTitle),
      expectText: str(audience.expectText, d.audience.expectText),
      qualities: qualities.length ? qualities : d.audience.qualities,
    },
    steps: {
      eyebrow: str(steps.eyebrow, d.steps.eyebrow),
      title: str(steps.title, d.steps.title),
      items: fixed(steps.items, d.steps.items, JOIN_STEPS_COUNT, (item, fb) => ({
        title: str(rec(item).title, fb.title),
        text: str(rec(item).text, fb.text),
      })),
      note: str(steps.note, d.steps.note),
    },
    final: {
      eyebrow: str(final.eyebrow, d.final.eyebrow),
      title: str(final.title, d.final.title),
      text: str(final.text, d.final.text),
      photo: photo(final.photo, d.final.photo),
    },
  };
}

/** Identifiants des photos de la médiathèque utilisées par le contenu. */
export function joinPhotoIds(content: JoinPageContent): string[] {
  return [content.start.photo, ...content.experience.items.map((i) => i.photo), content.final.photo]
    .map((p) => p.imageId)
    .filter((id): id is string => Boolean(id));
}

type FormLike = { get(name: string): unknown };

function formPhoto(form: FormLike, prefix: string) {
  return { imageId: form.get(`${prefix}.imageId`), crop: form.get(`${prefix}.crop`), alt: form.get(`${prefix}.alt`) };
}

/**
 * Formulaire /admin/pages/nous-rejoindre → contenu complet (les champs vidés
 * reprennent le texte par défaut, comme à l'affichage).
 */
export function readJoinPageForm(form: FormLike): JoinPageContent {
  const g = (name: string) => form.get(name);
  const list = (count: number, build: (i: number) => Rec) => Array.from({ length: count }, (_, i) => build(i));
  const qualities = String(g("audience.qualities") ?? "")
    .split(/[,\n]/)
    .map((q) => q.trim())
    .filter(Boolean);
  return parseJoinPageContent({
    heroSubtitle: g("heroSubtitle"),
    heroAlt: g("heroAlt"),
    start: {
      eyebrow: g("start.eyebrow"),
      title: g("start.title"),
      text: g("start.text"),
      photo: formPhoto(form, "start.photo"),
    },
    experience: {
      eyebrow: g("experience.eyebrow"),
      title: g("experience.title"),
      text: g("experience.text"),
      items: list(JOIN_EXPERIENCE_COUNT, (i) => ({
        label: g(`experience.items.${i}.label`),
        photo: formPhoto(form, `experience.items.${i}.photo`),
      })),
    },
    ambition: {
      eyebrow: g("ambition.eyebrow"),
      title: g("ambition.title"),
      text: g("ambition.text"),
      items: list(JOIN_AMBITION_COUNT, (i) => ({
        title: g(`ambition.items.${i}.title`),
        text: g(`ambition.items.${i}.text`),
      })),
    },
    audience: {
      eyebrow: g("audience.eyebrow"),
      title: g("audience.title"),
      whoTitle: g("audience.whoTitle"),
      whoText: g("audience.whoText"),
      expectTitle: g("audience.expectTitle"),
      expectText: g("audience.expectText"),
      qualities,
    },
    steps: {
      eyebrow: g("steps.eyebrow"),
      title: g("steps.title"),
      items: list(JOIN_STEPS_COUNT, (i) => ({
        title: g(`steps.items.${i}.title`),
        text: g(`steps.items.${i}.text`),
      })),
      note: g("steps.note"),
    },
    final: {
      eyebrow: g("final.eyebrow"),
      title: g("final.title"),
      text: g("final.text"),
      photo: formPhoto(form, "final.photo"),
    },
  });
}

export type JoinCta = { label: string; target: string };

/**
 * Valeurs des emplacements de /nous-rejoindre que l'annonce peut remplacer.
 * L'annonce ne fait que REMPLACER des valeurs dans des emplacements fixes : la
 * structure de la page ne change jamais. Seule `deadline` n'existe que pendant
 * l'annonce (la ligne disparaît sans laisser d'espace).
 */
export type JoinSlots = {
  eyebrow: string;
  title: string;
  titleAccent: string | null;
  subtitle: string;
  cta: JoinCta;
  deadline: string | null;
};

export function joinSlots(page: Page, content: JoinPageContent, announcement: Announcement | null): JoinSlots {
  const permanent: JoinSlots = {
    eyebrow: page.eyebrow?.trim() || JOIN_FALLBACK.eyebrow,
    title: page.title?.trim() || JOIN_FALLBACK.title,
    titleAccent: null,
    subtitle: content.heroSubtitle,
    cta: {
      label: page.primaryCtaLabel?.trim() || JOIN_FALLBACK.ctaLabel,
      target: page.primaryCtaTarget?.trim() || JOIN_FALLBACK.ctaTarget,
    },
    deadline: null,
  };
  if (!announcement?.appliesToJoinPage) return permanent;
  const deadline = announcement.showDeadline ? formatDeadline(announcement.endsAt) : null;
  return {
    eyebrow: [
      announcement.eyebrow || announcement.bannerLabel || permanent.eyebrow,
      announcement.periodLabel?.replace(/^campagne\s+/i, ""),
    ]
      .filter(Boolean)
      .join(" · "),
    title: announcement.title || permanent.title,
    titleAccent: announcement.title ? announcement.titleAccent : null,
    subtitle: fillDateToken(announcement.subtitle, announcement.endsAt) || permanent.subtitle,
    cta:
      announcement.primaryCtaLabel && announcement.primaryCtaUrl
        ? {
            label: fillDateToken(announcement.primaryCtaLabel, announcement.endsAt),
            target: announcement.primaryCtaUrl,
          }
        : permanent.cta,
    deadline: deadline ? `Clôture le ${deadline}` : null,
  };
}
