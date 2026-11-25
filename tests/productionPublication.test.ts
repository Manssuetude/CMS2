import assert from "node:assert/strict";
import test from "node:test";
import {
  checkProductionPublication,
  missingProductionFiles,
  publicationBlockedMessage,
  publicationLegacyMessage,
} from "../src/utils/productionPublication.ts";

const both = { hasWord: true, hasPdf: true };
const noPdf = { hasWord: true, hasPdf: false };
const none = { hasWord: false, hasPdf: false };

test("missingProductionFiles — Word puis PDF", () => {
  assert.deepEqual(missingProductionFiles(both), []);
  assert.deepEqual(missingProductionFiles(noPdf), ["pdf"]);
  assert.deepEqual(missingProductionFiles(none), ["word", "pdf"]);
});

test("publication — nouvelle production publiée sans PDF : refusée", () => {
  const check = checkProductionPublication({ previousStatus: null, nextStatus: "published", files: noPdf });
  assert.equal(check.allowed, false);
  assert.deepEqual(check.missing, ["pdf"]);
  assert.equal(check.legacyWarning, false);
});

test("publication — brouillon ou archive qui passe en « Publié » sans fichiers : refusé", () => {
  assert.equal(
    checkProductionPublication({ previousStatus: "draft", nextStatus: "published", files: none }).allowed,
    false,
  );
  assert.equal(
    checkProductionPublication({ previousStatus: "archived", nextStatus: "published", files: noPdf }).allowed,
    false,
  );
});

test("publication — Word et PDF présents : autorisée", () => {
  const check = checkProductionPublication({ previousStatus: "draft", nextStatus: "published", files: both });
  assert.deepEqual(check, { allowed: true, missing: [], legacyWarning: false });
});

test("publication — brouillon sans fichiers : toujours enregistrable", () => {
  const check = checkProductionPublication({ previousStatus: null, nextStatus: "draft", files: none });
  assert.equal(check.allowed, true);
  assert.equal(check.legacyWarning, false);
});

test("publication — production déjà publiée sans PDF : reste modifiable, avec avertissement", () => {
  const check = checkProductionPublication({ previousStatus: "published", nextStatus: "published", files: noPdf });
  assert.equal(check.allowed, true);
  assert.equal(check.legacyWarning, true);
  assert.deepEqual(check.missing, ["pdf"]);
});

test("messages — accentués, sans tiret cadratin", () => {
  assert.equal(publicationBlockedMessage(["pdf"]), "Il manque le PDF : impossible d'enregistrer en « Publié »");
  assert.equal(
    publicationBlockedMessage(["word", "pdf"]),
    "Il manque le Word et le PDF : impossible d'enregistrer en « Publié »",
  );
  assert.match(publicationLegacyMessage(["pdf"]), /^Production en ligne sans PDF/);
  for (const message of [publicationBlockedMessage(["word"]), publicationLegacyMessage(["word", "pdf"])]) {
    assert.doesNotMatch(message, /—/);
  }
});
