import assert from "node:assert/strict";
import test from "node:test";
import { pickEventOfTheMoment } from "../src/utils/eventOfTheMoment.ts";
import type { Event } from "../src/types/cms.ts";

function makeEvent(overrides: Partial<Event> & { id: string }): Event {
  return {
    slug: overrides.id,
    title: overrides.id,
    format: "atelier",
    description: null,
    body: null,
    date: null,
    startTime: null,
    endTime: null,
    location: null,
    capacity: null,
    eventbriteUrl: null,
    registrationStatus: null,
    status: "published",
    progressStatus: null,
    gallery: [],
    documents: [],
    speakers: [],
    featured: false,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

function daysFromNow(now: Date, offset: number): string {
  const d = new Date(now);
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

// Jeudi — en milieu de semaine pour laisser de la marge des deux côtés dans les tests "cette semaine".
const now = new Date("2026-08-20T00:00:00Z");

test("pickEventOfTheMoment — préfère un événement de cette semaine à un autre plus proche en dehors", () => {
  const thisWeek = makeEvent({ id: "this-week", date: daysFromNow(now, 2) });
  const closerButNextWeek = makeEvent({ id: "next-week", date: daysFromNow(now, 6) });
  assert.equal(pickEventOfTheMoment([closerButNextWeek, thisWeek], null, now)?.id, "this-week");
});

test("pickEventOfTheMoment — plusieurs événements cette semaine → le plus proche d'aujourd'hui", () => {
  const closer = makeEvent({ id: "closer", date: daysFromNow(now, 1) });
  const farther = makeEvent({ id: "farther", date: daysFromNow(now, -2) });
  assert.equal(pickEventOfTheMoment([farther, closer], null, now)?.id, "closer");
});

test("pickEventOfTheMoment — rien cette semaine, repli admin défini → utilise le repli", () => {
  const nextMonth = makeEvent({ id: "next-month", date: daysFromNow(now, 30) });
  const fallback = makeEvent({ id: "fallback-pick", date: daysFromNow(now, -60) });
  assert.equal(pickEventOfTheMoment([nextMonth], fallback, now)?.id, "fallback-pick");
});

test("pickEventOfTheMoment — rien cette semaine, pas de repli → l'événement le plus proche toutes dates confondues", () => {
  const recentPast = makeEvent({ id: "recent-past", date: daysFromNow(now, -20) });
  const distantFuture = makeEvent({ id: "distant-future", date: daysFromNow(now, 200) });
  assert.equal(pickEventOfTheMoment([distantFuture, recentPast], null, now)?.id, "recent-past");
});

test("pickEventOfTheMoment — ignore les événements sans date", () => {
  const undated = makeEvent({ id: "undated", date: null });
  const dated = makeEvent({ id: "dated", date: daysFromNow(now, 30) });
  assert.equal(pickEventOfTheMoment([undated, dated], null, now)?.id, "dated");
});

test("pickEventOfTheMoment — aucun événement daté, pas de repli → null", () => {
  const undated = makeEvent({ id: "undated", date: null });
  assert.equal(pickEventOfTheMoment([undated], null, now), null);
});

test("pickEventOfTheMoment — liste vide, pas de repli → null", () => {
  assert.equal(pickEventOfTheMoment([], null, now), null);
});
