import assert from "node:assert/strict";
import test from "node:test";
import { estimateReadingTime } from "../src/utils/readingTime.ts";

test("estimateReadingTime — vide/nul → 1 min", () => {
  assert.equal(estimateReadingTime(null), "1 min");
  assert.equal(estimateReadingTime(undefined), "1 min");
  assert.equal(estimateReadingTime(""), "1 min");
});

test("estimateReadingTime — texte court → 1 min minimum", () => {
  assert.equal(estimateReadingTime("<p>Quelques mots seulement.</p>"), "1 min");
});

test("estimateReadingTime — ignore les balises HTML dans le comptage", () => {
  const words = Array(400).fill("mot").join(" ");
  assert.equal(estimateReadingTime(`<p>${words}</p>`), "2 min");
});

test("estimateReadingTime — arrondit au plus proche", () => {
  const words = Array(1000).fill("mot").join(" ");
  assert.equal(estimateReadingTime(words), "5 min");
});
