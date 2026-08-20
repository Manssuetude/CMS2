import assert from "node:assert/strict";
import test from "node:test";
import { pickActivityOfTheMoment } from "../src/utils/activityOfTheMoment.ts";
import type { Activity } from "../src/types/cms.ts";

function makeActivity(overrides: Partial<Activity> & { id: string }): Activity {
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

test("pickActivityOfTheMoment — préfère une activité de cette semaine à une autre plus proche en dehors", () => {
  const thisWeek = makeActivity({ id: "this-week", date: daysFromNow(now, 2) });
  const closerButNextWeek = makeActivity({ id: "next-week", date: daysFromNow(now, 6) });
  assert.equal(pickActivityOfTheMoment([closerButNextWeek, thisWeek], null, now)?.id, "this-week");
});

test("pickActivityOfTheMoment — plusieurs activités cette semaine → la plus proche d'aujourd'hui", () => {
  const closer = makeActivity({ id: "closer", date: daysFromNow(now, 1) });
  const farther = makeActivity({ id: "farther", date: daysFromNow(now, -2) });
  assert.equal(pickActivityOfTheMoment([farther, closer], null, now)?.id, "closer");
});

test("pickActivityOfTheMoment — rien cette semaine, repli admin défini → utilise le repli", () => {
  const nextMonth = makeActivity({ id: "next-month", date: daysFromNow(now, 30) });
  const fallback = makeActivity({ id: "fallback-pick", date: daysFromNow(now, -60) });
  assert.equal(pickActivityOfTheMoment([nextMonth], fallback, now)?.id, "fallback-pick");
});

test("pickActivityOfTheMoment — rien cette semaine, pas de repli → l'activité la plus proche toutes dates confondues", () => {
  const recentPast = makeActivity({ id: "recent-past", date: daysFromNow(now, -20) });
  const distantFuture = makeActivity({ id: "distant-future", date: daysFromNow(now, 200) });
  assert.equal(pickActivityOfTheMoment([distantFuture, recentPast], null, now)?.id, "recent-past");
});

test("pickActivityOfTheMoment — ignore les activités sans date", () => {
  const undated = makeActivity({ id: "undated", date: null });
  const dated = makeActivity({ id: "dated", date: daysFromNow(now, 30) });
  assert.equal(pickActivityOfTheMoment([undated, dated], null, now)?.id, "dated");
});

test("pickActivityOfTheMoment — aucune activité datée, pas de repli → null", () => {
  const undated = makeActivity({ id: "undated", date: null });
  assert.equal(pickActivityOfTheMoment([undated], null, now), null);
});

test("pickActivityOfTheMoment — liste vide, pas de repli → null", () => {
  assert.equal(pickActivityOfTheMoment([], null, now), null);
});
