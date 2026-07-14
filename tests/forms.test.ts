import assert from "node:assert/strict";
import test from "node:test";
import { formDefinitions, toSubmissionFormType } from "../src/constants/forms.ts";

test("toSubmissionFormType — don → donation, sinon identité", () => {
  assert.equal(toSubmissionFormType("don"), "donation");
  assert.equal(toSubmissionFormType("join"), "join");
  assert.equal(toSubmissionFormType("theme"), "theme");
  assert.equal(toSubmissionFormType("activity"), "activity");
});

test("formDefinitions — chaque formulaire a email + consentement RGPD", () => {
  for (const [type, fields] of Object.entries(formDefinitions)) {
    const names = fields.map((f) => f.name);
    assert.ok(names.includes("email"), `${type} doit avoir un champ email`);
    assert.ok(names.includes("consent"), `${type} doit avoir un consentement`);
    const consent = fields.find((f) => f.name === "consent");
    assert.equal(consent?.type, "checkbox");
    assert.equal(consent?.required, true);
  }
});

test("formDefinitions — pas de champ de type file (pièce jointe retirée)", () => {
  for (const fields of Object.values(formDefinitions)) {
    assert.ok(fields.every((f) => f.type !== "file"));
  }
});

test("formDefinitions — le formulaire d'adhésion a les champs obligatoires attendus", () => {
  const required = formDefinitions.join.filter((f) => f.required).map((f) => f.name);
  for (const key of ["firstName", "lastName", "email", "phone", "city"]) {
    assert.ok(required.includes(key), `join.${key} doit être obligatoire`);
  }
});
