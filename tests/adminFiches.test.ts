import assert from "node:assert/strict";
import test from "node:test";
import type { Theme } from "../src/types/cms.ts";
import { archivedHiddenLabel, selectableThemes, themeOptionLabel } from "../src/utils/themePicker.ts";
import { copyTitle, uniqueSlug } from "../src/utils/duplicate.ts";
import { isPastEvent, needsEventReport, parisToday } from "../src/utils/eventReport.ts";

const theme = (id: string, status: Theme["status"]): Theme =>
  ({ id, slug: id, title: `Thème ${id}`, status, featured: false, tags: [], createdAt: "", updatedAt: "" }) as Theme;

test("thèmes proposés — archivés masqués sauf s'ils sont déjà rattachés", () => {
  const all = [theme("a", "published"), theme("b", "archived"), theme("c", "draft"), theme("d", "archived")];
  const { themes, archivedHiddenCount } = selectableThemes(all, ["d"]);
  assert.deepEqual(
    themes.map((t) => t.id),
    ["a", "c", "d"],
  );
  assert.equal(archivedHiddenCount, 1);
  assert.equal(themeOptionLabel(all[3]), "Thème d (archivé)");
  assert.equal(archivedHiddenLabel(1), "1 thème archivé masqué");
  assert.equal(archivedHiddenLabel(6), "6 thèmes archivés masqués");
  assert.equal(archivedHiddenLabel(0), null);
});

test("duplication — titre « Copie de … » et slug unique", () => {
  assert.equal(copyTitle("La ZLECAf"), "Copie de La ZLECAf");
  assert.equal(uniqueSlug("copie-de-zlecaf", []), "copie-de-zlecaf");
  assert.equal(uniqueSlug("copie-de-zlecaf", ["copie-de-zlecaf", "copie-de-zlecaf-2"]), "copie-de-zlecaf-3");
});

test("événement passé sans photos ni compte-rendu", () => {
  const today = "2026-11-23";
  assert.equal(isPastEvent({ date: "2026-11-22" }, today), true);
  assert.equal(isPastEvent({ date: "2026-11-23" }, today), false);
  assert.equal(isPastEvent({ date: null }, today), false);
  assert.equal(needsEventReport({ date: "2026-09-23", gallery: [], documents: [] }, today), true);
  assert.equal(needsEventReport({ date: "2026-09-23", gallery: ["x"] }, today), false);
  assert.equal(needsEventReport({ date: "2026-12-01", gallery: [] }, today), false);
  assert.equal(parisToday(new Date("2026-11-23T23:30:00Z")), "2026-11-24");
});
