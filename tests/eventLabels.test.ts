import assert from "node:assert/strict";
import test from "node:test";
import { aboutHeading, eventFormatLabel, shortDateLabel, timeRangeLabel } from "../src/utils/eventLabels.ts";

test("aboutHeading — titre selon le format", () => {
  assert.equal(aboutHeading("Atelier & Seance de travail"), "À propos de l'atelier");
  assert.equal(aboutHeading("Debat & Conference"), "À propos du débat");
  assert.equal(aboutHeading("formation"), "À propos de la formation");
  assert.equal(aboutHeading("Autre chose"), "À propos de l'événement");
});

test("eventFormatLabel — accents rétablis, inconnu inchangé", () => {
  assert.equal(eventFormatLabel("Debat & Conference"), "Débat & Conférence");
  assert.equal(eventFormatLabel("formation"), "formation");
});

test("shortDateLabel — « Mer. 23 sept. 2026 »", () => {
  assert.equal(shortDateLabel("2026-09-23"), "Mer. 23 sept. 2026");
  assert.equal(shortDateLabel(null), null);
});

test("timeRangeLabel — « 17h30 à 22h00 »", () => {
  assert.equal(timeRangeLabel("17:30", "22:00"), "17h30 à 22h00");
  assert.equal(timeRangeLabel("09:05:00", null), "9h05");
  assert.equal(timeRangeLabel(null, "22:00"), null);
});
