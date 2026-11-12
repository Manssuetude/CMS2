import assert from "node:assert/strict";
import test from "node:test";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { JoinEditorial } from "../src/components/public/JoinEditorial.tsx";
import { DEFAULT_JOIN_CONTENT } from "../src/constants/joinPage.ts";
import { DEFAULT_KEY_FIGURES } from "../src/constants/keyFigures.ts";
import { pickLiveAnnouncement } from "../src/utils/announcements.ts";
import { joinSlots, parseJoinPageContent, readJoinPageForm } from "../src/utils/joinPage.ts";
import type { Announcement, Page } from "../src/types/cms.ts";

// tsx compile le JSX des composants en React.createElement (runtime classique).
(globalThis as { React?: typeof React }).React = React;

// /nous-rejoindre rendue avec et sans annonce : même structure de sections,
// et aucune trace de l'annonce (texte, lien, date) une fois celle-ci terminée.

const page: Page = {
  id: "p",
  slug: "nous-rejoindre",
  title: "Construisons ensemble une voix citoyenne.",
  eyebrow: "Rejoindre Manssuétude",
  imageId: "hero",
  imageUrl: "/test/hero.jpg",
  imageWidth: 1600,
  imageHeight: 1200,
  imageCrop: { x: 0, y: 30, width: 100, height: 50, zoom: 1 },
  primaryCtaLabel: "Devenir membre",
  primaryCtaTarget: "memberApplication",
  sections: [],
  content: {},
  status: "published",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const announcement: Announcement = {
  id: "a",
  name: "Recrutement nov.–déc. 2026",
  enabled: true,
  startsAt: "2026-11-01T00:00:00.000Z",
  endsAt: "2026-12-31T22:59:00.000Z",
  bannerEnabled: true,
  bannerLabel: "Candidatures ouvertes",
  bannerText: "Manssuétude recrute de nouveaux membres jusqu'au {date}.",
  bannerLinkLabel: "Rejoindre Manssuétude →",
  bannerLinkUrl: "/nous-rejoindre",
  heroEnabled: true,
  eyebrow: "CANDIDATURES OUVERTES",
  title: "Manssuétude",
  titleAccent: "recrute.",
  subtitle: "Un an pour poser les fondations. La suite, nous voulons la construire avec vous.",
  imageId: null,
  imageUrl: null,
  imageAlt: null,
  imageWidth: null,
  imageHeight: null,
  imageCrop: null,
  primaryCtaLabel: "Candidater",
  primaryCtaUrl: "https://forms.gle/NyM9MDZrdKcocHAW8",
  secondaryCtaLabel: "Pourquoi nous rejoindre",
  secondaryCtaUrl: "/nous-rejoindre",
  periodLabel: "Campagne novembre – décembre 2026",
  showDeadline: true,
  showKeyFigures: true,
  finalEnabled: true,
  finalEyebrow: "REJOINDRE MANSSUÉTUDE",
  finalTitle: "Il y a encore tant de questions à poser.",
  finalText: "Remplissez le formulaire.",
  finalCtaLabel: "Candidater",
  finalCtaUrl: "https://forms.gle/NyM9MDZrdKcocHAW8",
  headerBadge: "OUVERT",
  appliesToJoinPage: true,
  seoTitle: null,
  seoDescription: null,
  createdAt: "2026-10-01T00:00:00.000Z",
  updatedAt: "2026-10-01T00:00:00.000Z",
};

const content = parseJoinPageContent({
  start: { photo: { imageId: "start" } },
  final: { photo: { imageId: "final" } },
});
const photos = {
  start: { url: "/test/start.jpg", width: 2400, height: 1800 },
  final: { url: "/test/final.jpg", width: 1365, height: 2048 },
};

function render(live: Announcement | null): string {
  return renderToStaticMarkup(
    React.createElement(JoinEditorial, { page, content, photos, keyFigures: DEFAULT_KEY_FIGURES, announcement: live }),
  );
}

// Squelette d'une section : suite des classes des éléments (le type de balise
// du bouton peut varier : <button> du formulaire d'adhésion, <a> d'un lien).
function sections(html: string): { name: string; skeleton: string[] }[] {
  const parts = html.split(/(?=<section )/).filter((part) => part.startsWith("<section "));
  return parts.map((part) => ({
    name: /data-section="([^"]+)"/.exec(part)?.[1] ?? "?",
    skeleton: [...part.matchAll(/class="([^"]*)"/g)].map((m) => m[1]),
  }));
}

// Retire la ligne « Clôture le … » (et son icône), seul emplacement propre à l'annonce.
const withoutDeadline = (skeleton: string[]) =>
  skeleton.filter(
    (cls, i) => cls !== "join-deadline" && !(skeleton[i - 1] === "join-deadline" && cls.includes("lucide")),
  );

const DURING = new Date("2026-11-15T12:00:00.000Z");
const AFTER = new Date("2027-01-02T12:00:00.000Z");

test("la page garde les 8 sections dans le même ordre, avec ou sans annonce", () => {
  const during = sections(render(pickLiveAnnouncement([announcement], DURING)));
  const after = sections(render(pickLiveAnnouncement([announcement], AFTER)));
  const expected = ["hero", "depart", "chiffres", "experience", "cap", "profil", "etapes", "candidater"];
  assert.deepEqual(
    during.map((s) => s.name),
    expected,
  );
  assert.deepEqual(
    after.map((s) => s.name),
    expected,
  );
  // Même structure, à la seule ligne « Clôture le … » près (absente sans annonce).
  assert.deepEqual(
    during.map((s) => withoutDeadline(s.skeleton)),
    after.map((s) => s.skeleton),
  );
});

test("pendant l'annonce : étiquette, titre, sous-titre, bouton et clôture de l'annonce", () => {
  const html = render(pickLiveAnnouncement([announcement], DURING));
  assert.match(html, /CANDIDATURES OUVERTES/);
  assert.match(html, /Manssuétude <em>recrute\.<\/em>/);
  assert.match(html, /Un an pour poser les fondations/);
  assert.match(html, /href="https:\/\/forms\.gle\/NyM9MDZrdKcocHAW8" target="_blank" rel="noopener noreferrer"/);
  // Clôture affichée deux fois : hero et section « Rejoindre ».
  assert.equal(html.match(/Clôture le 31 décembre 2026/g)?.length, 2);
  assert.doesNotMatch(html, /Devenir membre/);
});

test("après l'annonce : aucune trace (texte, lien, date), valeurs permanentes de la page", () => {
  const html = render(pickLiveAnnouncement([announcement], AFTER));
  for (const trace of [
    "CANDIDATURES OUVERTES",
    "Candidatures ouvertes",
    "recrute",
    "Un an pour poser",
    "forms.gle",
    "Clôture",
    "31 décembre",
    "join-deadline",
  ]) {
    assert.equal(html.includes(trace), false, `trace restante : ${trace}`);
  }
  assert.match(html, /Construisons ensemble une voix citoyenne\./);
  assert.match(html, /Rejoindre Manssuétude/);
  // Bouton permanent « Devenir membre » (formulaire d'adhésion) dans le hero et en bas de page.
  assert.equal(html.match(/>Devenir membre</g)?.length, 2);
  assert.match(html, new RegExp(DEFAULT_JOIN_CONTENT.heroSubtitle.slice(0, 40).replace(/[()]/g, "\\$&")));
});

test("une annonce qui ne s'applique pas à la page ne change rien", () => {
  const notApplied = { ...announcement, appliesToJoinPage: false };
  assert.deepEqual(joinSlots(page, content, notApplied), joinSlots(page, content, null));
});

test("chaque photo garde son alt descriptif et l'ancre #candidater existe", () => {
  const html = render(null);
  assert.match(html, /id="candidater"/);
  assert.match(html, new RegExp(`alt="${DEFAULT_JOIN_CONTENT.start.photo.alt.replace(/'/g, "&#x27;")}"`));
  assert.match(html, /alt="Table ronde Manssuétude/);
  // Seule la photo du hero est prioritaire.
  assert.equal(html.match(/<img[^>]*fetchpriority="high"/gi)?.length, 1);
});

test("formulaire admin : champs vidés → texte par défaut, nombre d'éléments fixe", () => {
  const values: Record<string, string> = {
    "start.title": "Nouveau titre",
    "audience.qualities": "Curiosité, Écoute\nRigueur",
    "steps.items.1.title": "",
    "experience.items.0.photo.imageId": "img-1",
    "experience.items.0.photo.crop": JSON.stringify({ x: 0, y: 0, width: 80, height: 80, zoom: 1.25 }),
  };
  const parsed = readJoinPageForm({ get: (name: string) => values[name] ?? null });
  assert.equal(parsed.start.title, "Nouveau titre");
  assert.equal(parsed.start.text, DEFAULT_JOIN_CONTENT.start.text);
  assert.deepEqual(parsed.audience.qualities, ["Curiosité", "Écoute", "Rigueur"]);
  assert.equal(parsed.steps.items.length, 4);
  assert.equal(parsed.steps.items[1].title, "Candidater");
  assert.equal(parsed.experience.items[0].photo.imageId, "img-1");
  assert.equal(parsed.experience.items[0].photo.crop?.width, 80);
  assert.equal(parsed.experience.items.length, 3);
});
