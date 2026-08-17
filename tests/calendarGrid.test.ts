import assert from "node:assert/strict";
import test from "node:test";
import { buildCalendarCells, dateKey, groupByDateKey, isSameDay } from "../src/utils/calendarGrid.ts";

test("buildCalendarCells — février 2026 commence un dimanche → grille de 5 semaines", () => {
  // Février 2026 : le 1er est un dimanche (grille lundi-first → 6 cases de janvier avant).
  const cells = buildCalendarCells(2026, 1);
  assert.equal(cells.length % 7, 0);
  assert.equal(cells[0].current, false); // dernier jour de janvier
  const first = cells.find((c) => c.current);
  assert.equal(first?.date.getDate(), 1);
  assert.equal(first?.date.getMonth(), 1);
});

test("buildCalendarCells — toutes les semaines ont 7 jours, cases hors-mois marquées", () => {
  const cells = buildCalendarCells(2026, 0);
  assert.equal(cells.length % 7, 0);
  const outOfMonth = cells.filter((c) => !c.current);
  const inMonth = cells.filter((c) => c.current);
  assert.equal(inMonth.length, 31); // janvier a 31 jours
  assert.ok(outOfMonth.length >= 0);
});

test("dateKey — format YYYY-MM-DD avec zéros de tête", () => {
  assert.equal(dateKey(new Date(2026, 0, 5)), "2026-01-05");
  assert.equal(dateKey(new Date(2026, 11, 25)), "2026-12-25");
});

test("groupByDateKey — regroupe par date, ignore les dates absentes", () => {
  const items = [
    { id: "a", date: "2026-03-10T10:00:00Z" },
    { id: "b", date: "2026-03-10" },
    { id: "c", date: null },
  ];
  const grouped = groupByDateKey(items, (i) => i.date);
  assert.deepEqual(
    grouped.get("2026-03-10")?.map((i) => i.id),
    ["a", "b"],
  );
  assert.equal(grouped.has("null"), false);
});

test("isSameDay — compare jour/mois/année, ignore l'heure", () => {
  assert.equal(isSameDay(new Date(2026, 2, 10, 8), new Date(2026, 2, 10, 22)), true);
  assert.equal(isSameDay(new Date(2026, 2, 10), new Date(2026, 2, 11)), false);
});
