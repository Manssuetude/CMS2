import assert from "node:assert/strict";
import test from "node:test";
import { aboutHeading, eventFormatLabel } from "../src/utils/eventLabels.ts";

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
