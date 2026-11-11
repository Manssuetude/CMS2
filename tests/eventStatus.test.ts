import assert from "node:assert/strict";
import test from "node:test";
import { eventStatusLabel, resolveEventStatus } from "../src/utils/eventStatus.ts";

const now = new Date("2026-11-11T12:00:00");

test("resolveEventStatus — un seul statut « Terminé » (inscriptions + avancement)", () => {
  assert.equal(
    resolveEventStatus({ registrationStatus: "termine", progressStatus: "completed", date: "2026-09-23", now }),
    "termine",
  );
  assert.equal(resolveEventStatus({ progressStatus: "completed", now }), "termine");
});

test("resolveEventStatus — date passée → Terminé, même si inscriptions ouvertes", () => {
  assert.equal(resolveEventStatus({ registrationStatus: "ouvertes", date: "2026-11-10", now }), "termine");
});

test("resolveEventStatus — le jour même reste ouvert", () => {
  assert.equal(resolveEventStatus({ registrationStatus: "ouvertes", date: "2026-11-11", now }), "ouvertes");
});

test("resolveEventStatus — à venir : complet, ouvertes, sinon À venir", () => {
  assert.equal(resolveEventStatus({ registrationStatus: "complet", date: "2026-12-01", now }), "complet");
  assert.equal(resolveEventStatus({ registrationStatus: "ouvertes", date: "2026-12-01", now }), "ouvertes");
  assert.equal(resolveEventStatus({ registrationStatus: "a-venir", date: "2026-12-01", now }), "a-venir");
  assert.equal(resolveEventStatus({ date: null, progressStatus: "preparation", now }), "a-venir");
});

test("eventStatusLabel — libellés", () => {
  assert.equal(eventStatusLabel("termine"), "Terminé");
  assert.equal(eventStatusLabel("ouvertes"), "Inscriptions ouvertes");
});
