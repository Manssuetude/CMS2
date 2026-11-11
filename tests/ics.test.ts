import assert from "node:assert/strict";
import test from "node:test";
import { buildIcs, escapeIcsText, foldIcsLine } from "../src/utils/ics.ts";

const now = new Date("2026-11-11T10:00:00Z");

test("buildIcs — heures de Paris converties en UTC (été : UTC+2)", () => {
  const ics = buildIcs({
    uid: "evt-1@manssuetude.com",
    title: "La ZLECAf à l'épreuve des réalités",
    location: "Campus Condorcet, Aubervilliers",
    url: "https://www.manssuetude.com/evenements/zlecaf",
    date: "2026-09-23",
    startTime: "17:30",
    endTime: "22:00",
    now,
  });
  assert.match(ics, /^BEGIN:VCALENDAR\r\n/);
  assert.match(ics, /DTSTART:20260923T153000Z\r\n/);
  assert.match(ics, /DTEND:20260923T200000Z\r\n/);
  assert.match(ics, /LOCATION:Campus Condorcet\\, Aubervilliers\r\n/);
  assert.match(ics, /DTSTAMP:20261111T100000Z\r\n/);
  assert.ok(ics.endsWith("END:VCALENDAR\r\n"));
});

test("buildIcs — sans heure de fin : 2 heures ; hiver : UTC+1", () => {
  const ics = buildIcs({ uid: "u", title: "Atelier", date: "2026-12-10", startTime: "18:00", now });
  assert.match(ics, /DTSTART:20261210T170000Z/);
  assert.match(ics, /DTEND:20261210T190000Z/);
});

test("buildIcs — sans heure : événement sur la journée", () => {
  const ics = buildIcs({ uid: "u", title: "Atelier", date: "2026-12-31", now });
  assert.match(ics, /DTSTART;VALUE=DATE:20261231/);
  assert.match(ics, /DTEND;VALUE=DATE:20270101/);
});

test("escapeIcsText — antislash, point-virgule, virgule, retour à la ligne", () => {
  assert.equal(escapeIcsText("a\\b;c,d\ne"), String.raw`a\\b\;c\,d\ne`);
});

test("foldIcsLine — lignes de 75 octets max, continuation par un espace", () => {
  const folded = foldIcsLine(`DESCRIPTION:${"é".repeat(80)}`);
  for (const line of folded.split("\r\n")) assert.ok(new TextEncoder().encode(line).length <= 75);
  assert.ok(folded.includes("\r\n "));
});
