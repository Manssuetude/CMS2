import assert from "node:assert/strict";
import test from "node:test";
import { submissionConfirmationSubject, submissionConfirmationHtml } from "../src/lib/email.ts";

test("submissionConfirmationSubject — un libellé par type de formulaire connu", () => {
  assert.equal(submissionConfirmationSubject("join"), "Votre candidature a bien été reçue");
  assert.equal(submissionConfirmationSubject("content"), "Votre contribution a bien été reçue");
  assert.equal(submissionConfirmationSubject("event"), "Votre proposition d'événement a bien été reçue");
});

test("submissionConfirmationSubject — repli générique pour un type inconnu", () => {
  assert.equal(submissionConfirmationSubject("inconnu"), "Votre demande a bien été reçue");
});

test("submissionConfirmationHtml — contient l'intro adaptée au type", () => {
  assert.match(submissionConfirmationHtml("join"), /candidature/);
  assert.match(submissionConfirmationHtml("partner"), /partenariat/);
});

test("submissionConfirmationHtml — repli générique pour un type inconnu", () => {
  assert.match(submissionConfirmationHtml("inconnu"), /Nous avons bien reçu votre demande/);
});
