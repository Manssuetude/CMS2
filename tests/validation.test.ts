import assert from "node:assert/strict";
import test from "node:test";
import {
  formTypeSchema,
  idSchema,
  contentStatusSchema,
  mediaMetadataSchema,
  newsletterSubscribeSchema,
} from "../src/lib/validation.ts";

test("formTypeSchema — accepte les 11 types, refuse le reste", () => {
  for (const t of [
    "join",
    "project",
    "content",
    "partner",
    "donation",
    "theme",
    "sub_theme",
    "event",
    "activity",
    "production",
    "contact",
  ]) {
    assert.equal(formTypeSchema.safeParse(t).success, true, t);
  }
  assert.equal(formTypeSchema.safeParse("don").success, false);
  assert.equal(formTypeSchema.safeParse("").success, false);
});

test("idSchema — non vide", () => {
  assert.equal(idSchema.safeParse("abc").success, true);
  assert.equal(idSchema.safeParse("").success, false);
});

test("contentStatusSchema — enum de statuts", () => {
  assert.equal(contentStatusSchema.safeParse("published").success, true);
  assert.equal(contentStatusSchema.safeParse("nope").success, false);
});

test("mediaMetadataSchema — visibility par défaut = draft", () => {
  const parsed = mediaMetadataSchema.parse({ title: "x" });
  assert.equal(parsed.visibility, "draft");
});

test("newsletterSubscribeSchema — exige un email valide et le consentement coché", () => {
  assert.equal(newsletterSubscribeSchema.safeParse({ email: "a@b.com", consent: "on" }).success, true);
  assert.equal(newsletterSubscribeSchema.safeParse({ email: "pas-un-email", consent: "on" }).success, false);
  assert.equal(newsletterSubscribeSchema.safeParse({ email: "a@b.com", consent: "" }).success, false);
  assert.equal(newsletterSubscribeSchema.safeParse({ email: "a@b.com" }).success, false);
});
