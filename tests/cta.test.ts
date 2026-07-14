import assert from "node:assert/strict";
import test from "node:test";
import { resolveCta, isFormCta, ctaLinks } from "../src/lib/cta.ts";

test("resolveCta — clé connue → chemin", () => {
  assert.equal(resolveCta("join"), "/nous-rejoindre");
  assert.equal(resolveCta("productions"), "/productions");
});

test("resolveCta — clé inconnue → renvoyée telle quelle", () => {
  assert.equal(resolveCta("/une/url"), "/une/url");
  assert.equal(resolveCta("https://linktr.ee/x"), "https://linktr.ee/x");
});

test("resolveCta — vide → accueil", () => {
  assert.equal(resolveCta(null), "/");
  assert.equal(resolveCta(undefined), "/");
});

test("isFormCta — détecte les cibles de formulaire", () => {
  assert.equal(isFormCta("FORM:join"), true);
  assert.equal(isFormCta(ctaLinks.donate), true);
  assert.equal(isFormCta("/themes"), false);
});
