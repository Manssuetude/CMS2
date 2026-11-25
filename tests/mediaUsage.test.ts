import assert from "node:assert/strict";
import test from "node:test";
import { collectMediaUsage, matchesMediaFilter } from "../src/utils/mediaUsage.ts";

test("médiathèque — « Utilisé dans » : colonnes, listes et texte JSON, sans doublon", () => {
  const usage = collectMediaUsage(
    ["m1", "m2", "m3"],
    [
      { label: "Annonce · Recrutement", href: "/admin/annonces/a/edit", ids: ["m1"] },
      { label: "Événement · Débat", href: "/admin/evenements/e/edit", ids: ["m2", "m1"] },
      { label: "Page Nous rejoindre", href: "/admin/pages/nous-rejoindre", ids: [], text: '{"photo":"m1"}' },
      { label: "Événement · Débat", href: "/admin/evenements/e/edit", ids: ["m1"] },
    ],
  );
  assert.deepEqual(
    usage.m1.map((u) => u.label),
    ["Annonce · Recrutement", "Événement · Débat", "Page Nous rejoindre"],
  );
  assert.deepEqual(usage.m3, []);
});

test("médiathèque — filtres Tout, Images, Documents, Sans texte alternatif", () => {
  const image = { type: "image", alt: "" };
  const pdf = { type: "pdf", alt: null };
  assert.equal(matchesMediaFilter(image, "sans-alt"), true);
  assert.equal(matchesMediaFilter({ type: "image", alt: "Photo" }, "sans-alt"), false);
  assert.equal(matchesMediaFilter(pdf, "sans-alt"), false);
  assert.equal(matchesMediaFilter(pdf, "documents"), true);
  assert.equal(matchesMediaFilter(pdf, "images"), false);
  assert.equal(matchesMediaFilter(pdf, "tout"), true);
});
