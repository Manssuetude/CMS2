import assert from "node:assert/strict";
import test from "node:test";
import {
  completeDescription,
  formatDateFr,
  META_DESCRIPTION_MAX,
  stripBrandSuffix,
  toHeadline,
  toMetaDescription,
  toParisIsoDateTime,
} from "../src/utils/seoText.ts";

test("stripBrandSuffix — retire « - / · / | Manssuétude » en fin de titre", () => {
  assert.equal(stripBrandSuffix("Productions - Manssuétude"), "Productions");
  assert.equal(stripBrandSuffix("Nous joindre · Manssuétude"), "Nous joindre");
  assert.equal(stripBrandSuffix("Dossiers | Manssuétude"), "Dossiers");
  assert.equal(stripBrandSuffix("À propos — Manssuetude"), "À propos");
  assert.equal(stripBrandSuffix("La ZLECAf à l'épreuve des réalités"), "La ZLECAf à l'épreuve des réalités");
  assert.equal(stripBrandSuffix("Manssuétude et la jeunesse"), "Manssuétude et la jeunesse");
});

test("toMetaDescription — texte court inchangé, HTML retiré", () => {
  assert.equal(toMetaDescription("<p>Une  description\ncourte.</p>"), "Une description courte.");
});

test("toMetaDescription — tronque à 160 caractères max sur une fin de mot", () => {
  const long = "Lorem ipsum dolor sit amet ".repeat(20);
  const result = toMetaDescription(long);
  assert.ok(result.length <= META_DESCRIPTION_MAX, `longueur ${result.length}`);
  assert.ok(result.endsWith("…"));
  assert.ok(!/\s…$/.test(result));
});

test("completeDescription — complète une description courte jusqu'à 140-160", () => {
  const result = completeDescription("Atelier sur la ZLECAf.", [
    "Événement du 23 septembre 2026 à Paris.",
    "Un événement Manssuétude sur l'Afrique et ses diasporas, ouvert à toutes et à tous.",
  ]);
  assert.ok(result.startsWith("Atelier sur la ZLECAf. Événement du 23 septembre 2026 à Paris."));
  assert.ok(result.length <= META_DESCRIPTION_MAX, `longueur ${result.length}`);
});

test("completeDescription — n'ajoute rien à une description déjà assez longue", () => {
  const base = "x".repeat(150);
  assert.equal(completeDescription(base, ["Complément."]), base);
});

test("completeDescription — ignore un complément qui ferait dépasser 160", () => {
  const base =
    "Une description de cent trente caractères environ, écrite pour vérifier que le complément trop long est bien ignoré ici.";
  assert.equal(completeDescription(base, ["y".repeat(80)]), base);
});

test("completeDescription — base vide : utilise les compléments, ignore les vides", () => {
  assert.equal(completeDescription(null, [null, "", "Un projet de Manssuétude."]), "Un projet de Manssuétude.");
});

test("formatDateFr — date ISO en français, null si invalide", () => {
  assert.equal(formatDateFr("2026-09-23"), "23 septembre 2026");
  assert.equal(formatDateFr(null), null);
  assert.equal(formatDateFr("pas une date"), null);
});

test("toHeadline — 110 caractères max, coupé sur un mot", () => {
  assert.equal(toHeadline("Titre court"), "Titre court");
  const long =
    "Juger l'œuvre, juger l'homme : comment une société décide : proposition d'un cadre d'analyse pour les œuvres controversées";
  const result = toHeadline(long);
  assert.ok(result.length <= 110, `longueur ${result.length}`);
  assert.ok(result.endsWith("…"));
});

test("toParisIsoDateTime — décalage été/hiver de Paris, date seule sans heure", () => {
  assert.equal(toParisIsoDateTime("2026-09-23", "17:30"), "2026-09-23T17:30:00+02:00");
  assert.equal(toParisIsoDateTime("2026-12-10", "18:00:00"), "2026-12-10T18:00:00+01:00");
  assert.equal(toParisIsoDateTime("2026-09-23", null), "2026-09-23");
  assert.equal(toParisIsoDateTime(null, "17:30"), null);
});
