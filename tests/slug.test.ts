import assert from "node:assert/strict";
import test from "node:test";
import { slugify } from "../src/utils/slug.ts";

test("slugify — minuscules, tirets, sans accents", () => {
  assert.equal(slugify("Transformation CEMAC"), "transformation-cemac");
  assert.equal(slugify("Intégration régionale & marchés"), "integration-regionale-marches");
  assert.equal(slugify("  Espaces   multiples  "), "espaces-multiples");
});

test("slugify — retire les tirets en début/fin", () => {
  assert.equal(slugify("---Bonjour---"), "bonjour");
  assert.equal(slugify("!!!"), "");
});

test("slugify — chiffres conservés", () => {
  assert.equal(slugify("Rapport 2026 v2"), "rapport-2026-v2");
});
