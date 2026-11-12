import assert from "node:assert/strict";
import test from "node:test";
import {
  announcementSeo,
  announcementState,
  announcementStatusLabel,
  duplicateAnnouncement,
  fillDateToken,
  findOverlaps,
  formatDeadline,
  internalPath,
  isExternalUrl,
  isValidLinkUrl,
  isoToParisLocal,
  parisLocalToIso,
  pickLiveAnnouncement,
  readAnnouncementForm,
  validateAnnouncement,
} from "../src/utils/announcements.ts";
import type { Announcement } from "../src/types/cms.ts";

function make(overrides: Partial<Announcement> & { id: string }): Announcement {
  return {
    name: overrides.id,
    enabled: true,
    startsAt: "2026-11-01T00:00:00.000Z",
    endsAt: "2026-12-31T23:00:00.000Z",
    bannerEnabled: true,
    bannerLabel: "Candidatures ouvertes",
    bannerText: null,
    bannerLinkLabel: null,
    bannerLinkUrl: null,
    heroEnabled: true,
    eyebrow: "CANDIDATURES OUVERTES",
    title: "Manssuétude",
    titleAccent: "recrute.",
    subtitle: "Un an pour poser les fondations.",
    imageId: null,
    imageUrl: null,
    imageAlt: null,
    imageWidth: null,
    imageHeight: null,
    imageCrop: null,
    primaryCtaLabel: "Candidater",
    primaryCtaUrl: "https://forms.gle/abc",
    secondaryCtaLabel: null,
    secondaryCtaUrl: null,
    periodLabel: null,
    showDeadline: true,
    showKeyFigures: true,
    finalEnabled: false,
    finalEyebrow: null,
    finalTitle: null,
    finalText: null,
    finalCtaLabel: null,
    finalCtaUrl: null,
    headerBadge: "OUVERT",
    appliesToJoinPage: true,
    seoTitle: null,
    seoDescription: null,
    createdAt: "2026-10-01T00:00:00.000Z",
    updatedAt: "2026-10-01T00:00:00.000Z",
    ...overrides,
  };
}

const at = (iso: string) => new Date(iso);

// ── getLive : bornes, désactivée, dates manquantes, chevauchement ───────────

test("en ligne dès starts_at (borne incluse)", () => {
  const a = make({ id: "a" });
  assert.equal(pickLiveAnnouncement([a], at("2026-11-01T00:00:00.000Z"))?.id, "a");
});

test("hors ligne à ends_at (borne exclue) et après", () => {
  const a = make({ id: "a" });
  assert.equal(pickLiveAnnouncement([a], at("2026-12-31T23:00:00.000Z")), null);
  assert.equal(pickLiveAnnouncement([a], at("2027-01-05T00:00:00.000Z")), null);
  assert.equal(pickLiveAnnouncement([a], at("2026-12-31T22:59:59.999Z"))?.id, "a");
});

test("hors ligne avant starts_at", () => {
  const a = make({ id: "a" });
  assert.equal(pickLiveAnnouncement([a], at("2026-10-31T23:59:59.999Z")), null);
});

test("une annonce désactivée n'est jamais en ligne", () => {
  const a = make({ id: "a", enabled: false });
  assert.equal(pickLiveAnnouncement([a], at("2026-11-15T12:00:00.000Z")), null);
  assert.equal(announcementState(a, at("2026-11-15T12:00:00.000Z")), "disabled");
});

test("dates manquantes : jamais en ligne", () => {
  const now = at("2026-11-15T12:00:00.000Z");
  for (const a of [
    make({ id: "a", startsAt: null }),
    make({ id: "b", endsAt: null }),
    make({ id: "c", startsAt: null, endsAt: null }),
    make({ id: "d", startsAt: "pas une date" }),
  ]) {
    assert.equal(pickLiveAnnouncement([a], now), null, a.id);
    assert.equal(announcementState(a, now), "undated", a.id);
  }
});

test("chevauchement : la plus récemment démarrée gagne", () => {
  const older = make({ id: "older", startsAt: "2026-11-01T00:00:00.000Z" });
  const newer = make({ id: "newer", startsAt: "2026-11-10T00:00:00.000Z" });
  const now = at("2026-11-15T12:00:00.000Z");
  assert.equal(pickLiveAnnouncement([older, newer], now)?.id, "newer");
  assert.equal(pickLiveAnnouncement([newer, older], now)?.id, "newer");
  // Avant le début de la plus récente, l'ancienne reste en ligne.
  assert.equal(pickLiveAnnouncement([older, newer], at("2026-11-05T00:00:00.000Z"))?.id, "older");
});

test("chevauchement à début égal : la dernière modifiée gagne", () => {
  const a = make({ id: "a", updatedAt: "2026-10-01T00:00:00.000Z" });
  const b = make({ id: "b", updatedAt: "2026-10-02T00:00:00.000Z" });
  assert.equal(pickLiveAnnouncement([a, b], at("2026-11-15T00:00:00.000Z"))?.id, "b");
});

test("findOverlaps : seulement les autres annonces activées qui recoupent", () => {
  const target = make({ id: "t", startsAt: "2026-11-01T00:00:00.000Z", endsAt: "2026-11-30T00:00:00.000Z" });
  const overlapping = make({ id: "o", startsAt: "2026-11-29T00:00:00.000Z", endsAt: "2026-12-10T00:00:00.000Z" });
  const adjacent = make({ id: "adj", startsAt: "2026-11-30T00:00:00.000Z", endsAt: "2026-12-10T00:00:00.000Z" });
  const disabled = make({ id: "off", enabled: false });
  const undated = make({ id: "nd", startsAt: null });
  const ids = findOverlaps(target, [target, overlapping, adjacent, disabled, undated]).map((a) => a.id);
  assert.deepEqual(ids, ["o"]);
});

test("statuts affichés dans l'admin", () => {
  const a = make({ id: "a", startsAt: "2026-11-01T08:00:00.000Z", endsAt: "2026-12-31T22:59:00.000Z" });
  assert.equal(
    announcementStatusLabel(a, at("2026-11-15T00:00:00.000Z")),
    "En ligne jusqu'au 31 décembre 2026 à 23 h 59",
  );
  assert.equal(announcementStatusLabel(a, at("2026-10-15T00:00:00.000Z")), "Programmée le 1er novembre 2026 à 09 h 00");
  assert.equal(announcementStatusLabel(a, at("2027-01-15T00:00:00.000Z")), "Terminée");
  assert.equal(announcementStatusLabel({ ...a, enabled: false }, at("2026-11-15T00:00:00.000Z")), "Désactivée");
});

// ── Heure de Paris ──────────────────────────────────────────────────────────

test("datetime-local (Paris) ↔ ISO, heure d'hiver et d'été", () => {
  assert.equal(parisLocalToIso("2026-12-31T23:59"), "2026-12-31T22:59:00.000Z");
  assert.equal(parisLocalToIso("2026-07-01T12:00"), "2026-07-01T10:00:00.000Z");
  assert.equal(parisLocalToIso(""), null);
  assert.equal(parisLocalToIso("n'importe quoi"), null);
  assert.equal(isoToParisLocal("2026-12-31T22:59:00.000Z"), "2026-12-31T23:59");
  assert.equal(isoToParisLocal("2026-07-01T10:00:00.000Z"), "2026-07-01T12:00");
  assert.equal(isoToParisLocal(null), "");
});

test("date de clôture : une fin à minuit se lit la veille", () => {
  assert.equal(formatDeadline("2026-12-31T22:59:00.000Z"), "31 décembre 2026");
  assert.equal(formatDeadline(parisLocalToIso("2027-01-01T00:00")), "31 décembre 2026");
  assert.equal(formatDeadline(null), null);
  assert.equal(fillDateToken("jusqu'au {date}.", "2026-12-31T22:59:00.000Z"), "jusqu'au 31 décembre 2026.");
  assert.equal(fillDateToken("sans jeton", null), "sans jeton");
});

// ── Liens ───────────────────────────────────────────────────────────────────

test("liens externes et internes", () => {
  assert.equal(isExternalUrl("https://forms.gle/NyM9MDZrdKcocHAW8"), true);
  assert.equal(isExternalUrl("https://www.manssuetude.com/nous-rejoindre"), false);
  assert.equal(isExternalUrl("/nous-rejoindre"), false);
  assert.equal(isValidLinkUrl("/nous-rejoindre"), true);
  assert.equal(isValidLinkUrl("#candidater"), true);
  assert.equal(isValidLinkUrl("https://forms.gle/abc"), true);
  assert.equal(isValidLinkUrl("//evil.example"), false);
  assert.equal(isValidLinkUrl("javascript:alert(1)"), false);
  assert.equal(isValidLinkUrl("forms.gle/abc"), false);
  assert.equal(internalPath("/nous-rejoindre#candidater"), "/nous-rejoindre");
  assert.equal(internalPath("https://www.manssuetude.com/nous-rejoindre"), "/nous-rejoindre");
  assert.equal(internalPath("https://forms.gle/abc"), null);
});

// ── Formulaire admin ────────────────────────────────────────────────────────

function form(values: Record<string, string>) {
  return { get: (name: string) => values[name] ?? null };
}

test("validation : fin après début, URL valides, titre si hero", () => {
  const base = {
    name: "Recrutement",
    startsAt: "2026-11-01T09:00",
    endsAt: "2026-12-31T23:59",
    heroEnabled: "on",
    title: "Manssuétude",
    bannerLabel: "Candidatures ouvertes",
    bannerEnabled: "on",
  };
  assert.equal(validateAnnouncement(readAnnouncementForm(form(base))), null);
  assert.match(
    validateAnnouncement(readAnnouncementForm(form({ ...base, endsAt: "2026-10-01T00:00" }))) ?? "",
    /fin doit être après/,
  );
  assert.match(validateAnnouncement(readAnnouncementForm(form({ ...base, title: "" }))) ?? "", /titre est obligatoire/);
  assert.match(
    validateAnnouncement(readAnnouncementForm(form({ ...base, primaryCtaUrl: "forms.gle/x" }))) ?? "",
    /bouton principal/,
  );
  assert.match(validateAnnouncement(readAnnouncementForm(form({ ...base, name: " " }))) ?? "", /nom interne/);
  assert.match(
    validateAnnouncement(readAnnouncementForm(form({ ...base, enabled: "on", startsAt: "" }))) ?? "",
    /dates de début et de fin/,
  );
});

test("duplication : désactivée, dates vidées, contenu conservé", () => {
  const copy = duplicateAnnouncement(make({ id: "a", name: "Recrutement 2026" }));
  assert.equal(copy.name, "Copie de Recrutement 2026");
  assert.equal(copy.enabled, false);
  assert.equal(copy.startsAt, null);
  assert.equal(copy.endsAt, null);
  assert.equal(copy.title, "Manssuétude");
  assert.equal("id" in copy, false);
});

test("SEO de l'annonce dérivé du titre et du libellé", () => {
  assert.deepEqual(announcementSeo(make({ id: "a" })), {
    title: "Manssuétude recrute | Candidatures ouvertes",
    description: "Un an pour poser les fondations.",
  });
  assert.equal(announcementSeo(make({ id: "a", seoTitle: "Titre imposé" })).title, "Titre imposé");
});
