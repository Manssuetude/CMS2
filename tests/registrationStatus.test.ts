import assert from "node:assert/strict";
import test from "node:test";
import { resolveRegistrationStatus, registrationStatusLabel } from "../src/utils/registrationStatus.ts";

const NOW = new Date("2026-06-15T12:00:00Z");

test("resolveRegistrationStatus — le statut manuel prend toujours le dessus", () => {
  assert.equal(resolveRegistrationStatus("complet", "2026-07-01", NOW), "complet");
  assert.equal(resolveRegistrationStatus("ouvertes", "2020-01-01", NOW), "ouvertes");
});

test("resolveRegistrationStatus — sans statut manuel, déduit de la date", () => {
  assert.equal(resolveRegistrationStatus(null, "2026-07-01", NOW), "a-venir");
  assert.equal(resolveRegistrationStatus(null, "2026-01-01", NOW), "termine");
});

test("resolveRegistrationStatus — sans date ni statut manuel → null", () => {
  assert.equal(resolveRegistrationStatus(null, null, NOW), null);
});

test("registrationStatusLabel — libellés français", () => {
  assert.equal(registrationStatusLabel("a-venir"), "À venir");
  assert.equal(registrationStatusLabel("ouvertes"), "Inscriptions ouvertes");
  assert.equal(registrationStatusLabel("complet"), "Complet");
  assert.equal(registrationStatusLabel("termine"), "Terminé");
});
