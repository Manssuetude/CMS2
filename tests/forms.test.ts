import assert from "node:assert/strict";
import test from "node:test";
import { formDefinitions, toSubmissionFormType } from "../src/constants/forms.ts";

test("toSubmissionFormType — don → donation, sinon identité", () => {
  assert.equal(toSubmissionFormType("don"), "donation");
  assert.equal(toSubmissionFormType("join"), "join");
  assert.equal(toSubmissionFormType("theme"), "theme");
  assert.equal(toSubmissionFormType("event"), "event");
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

test("formDefinitions — champs de type file uniquement là où une pièce jointe est prévue", () => {
  const fileFieldsByType = Object.fromEntries(
    Object.entries(formDefinitions).map(([type, fields]) => [type, fields.filter((f) => f.type === "file")]),
  );
  assert.deepEqual(
    fileFieldsByType.join.map((f) => f.name),
    ["cv"],
  );
  assert.deepEqual(
    fileFieldsByType.content.map((f) => f.name),
    ["attachment"],
  );
  for (const [type, fields] of Object.entries(fileFieldsByType)) {
    if (type === "join" || type === "content") continue;
    assert.deepEqual(fields, [], `${type} ne devrait pas avoir de champ file`);
  }
});

test("formDefinitions — le formulaire d'adhésion a les champs obligatoires attendus", () => {
  const required = formDefinitions.join.filter((f) => f.required).map((f) => f.name);
  for (const key of ["firstName", "lastName", "email", "phone", "city"]) {
    assert.ok(required.includes(key), `join.${key} doit être obligatoire`);
  }
});
