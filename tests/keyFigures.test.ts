import assert from "node:assert/strict";
import test from "node:test";
import { parseKeyFigures, readKeyFiguresForm } from "../src/utils/keyFigures.ts";
import { DEFAULT_KEY_FIGURES } from "../src/constants/keyFigures.ts";

test("valeurs par défaut si absent ou incomplet", () => {
  assert.deepEqual(parseKeyFigures(undefined), DEFAULT_KEY_FIGURES);
  assert.deepEqual(parseKeyFigures({ items: [{ value: "1", label: "seul" }] }).items, DEFAULT_KEY_FIGURES.items);
  assert.equal(DEFAULT_KEY_FIGURES.items.length, 4);
});

test("lecture : éléments incomplets ignorés, 4 au maximum", () => {
  const figures = parseKeyFigures({
    eyebrow: "Depuis 2025",
    title: "Bilan.",
    items: [
      { value: "1", label: "a" },
      { value: "", label: "vide" },
      { value: "2", label: "b" },
      { value: "3", label: "c" },
      { value: "4", label: "d" },
      { value: "5", label: "e" },
    ],
  });
  assert.equal(figures.eyebrow, "Depuis 2025");
  assert.deepEqual(
    figures.items.map((i) => i.value),
    ["1", "2", "3", "4"],
  );
});

test("formulaire admin : au moins 2 chiffres", () => {
  const get = (values: Record<string, string>) => ({ get: (name: string) => values[name] ?? null });
  assert.equal(readKeyFiguresForm(get({ keyFigureValue0: "20", keyFigureLabel0: "rencontres" })), null);
  const ok = readKeyFiguresForm(
    get({ keyFigureValue0: "20", keyFigureLabel0: "rencontres", keyFigureValue2: "~40", keyFigureLabel2: "membres" }),
  );
  assert.deepEqual(ok?.items, [
    { value: "20", label: "rencontres" },
    { value: "~40", label: "membres" },
  ]);
  assert.equal(ok?.title, DEFAULT_KEY_FIGURES.title);
});
