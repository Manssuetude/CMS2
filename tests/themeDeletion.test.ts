import assert from "node:assert/strict";
import test from "node:test";
import { checkThemeDeletion, themeDeletionSummary } from "../src/utils/themeDeletion.ts";

test("suppression d'un thème — bloquée tant qu'il a des sous-thèmes", () => {
  assert.deepEqual(checkThemeDeletion({ subThemeCount: 4, eventCount: 2, projectCount: 0 }), {
    allowed: false,
    reason: "sub-themes",
    subThemeCount: 4,
  });
});

test("suppression d'un thème — sans sous-thème : autorisée, avec le nombre de liens retirés", () => {
  assert.deepEqual(checkThemeDeletion({ subThemeCount: 0, eventCount: 3, projectCount: 1 }), {
    allowed: true,
    eventCount: 3,
    projectCount: 1,
  });
  assert.equal(
    themeDeletionSummary("Écologie", 3, 1),
    "Supprimer « Écologie » ? Il sera retiré de 3 événements et 1 projet. La suppression est définitive.",
  );
  assert.equal(themeDeletionSummary("Écologie", 0, 0), "Supprimer « Écologie » ? La suppression est définitive.");
});
