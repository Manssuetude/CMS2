import assert from "node:assert/strict";
import test from "node:test";
import { titleFontSize } from "../src/utils/titleSize.ts";

test("titleFontSize — titre court → taille par défaut (undefined)", () => {
  assert.equal(titleFontSize("Écologie"), undefined);
});

test("titleFontSize — titre moyen → réduction légère", () => {
  const size = titleFontSize("Citoyenneté, démocratie et institutions");
  assert.ok(size?.startsWith("clamp("));
});

test("titleFontSize — titre très long → réduction plus forte", () => {
  const size = titleFontSize("Souverainetés, technologies et rapports de puissance dans le monde contemporain");
  assert.ok(size?.startsWith("clamp("));
  assert.notEqual(size, titleFontSize("Citoyenneté, démocratie et institutions"));
});
