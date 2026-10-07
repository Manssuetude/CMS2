import assert from "node:assert/strict";
import test from "node:test";
import { signFormDigestToken, verifyFormDigestToken } from "../src/lib/formDigestToken.ts";

test("signFormDigestToken / verifyFormDigestToken — aller-retour valide", () => {
  const from = "2026-10-01T00:00:00.000Z";
  const to = "2026-10-04T00:00:00.000Z";
  const token = signFormDigestToken(from, to, Date.now() + 10_000);
  const result = verifyFormDigestToken(token);
  assert.deepEqual(result, { from, to });
});

test("verifyFormDigestToken — jeton expiré refusé", () => {
  const token = signFormDigestToken("2026-10-01T00:00:00.000Z", "2026-10-04T00:00:00.000Z", Date.now() - 1000);
  assert.equal(verifyFormDigestToken(token), null);
});

test("verifyFormDigestToken — signature altérée refusée", () => {
  const token = signFormDigestToken("2026-10-01T00:00:00.000Z", "2026-10-04T00:00:00.000Z", Date.now() + 10_000);
  const [payload] = token.split(".");
  const tampered = `${payload}.invalidsignature`;
  assert.equal(verifyFormDigestToken(tampered), null);
});

test("verifyFormDigestToken — payload altéré (plage de dates modifiée) refusé", () => {
  const token = signFormDigestToken("2026-10-01T00:00:00.000Z", "2026-10-04T00:00:00.000Z", Date.now() + 10_000);
  const [, signature] = token.split(".");
  const tamperedPayload = Buffer.from("2020-01-01T00:00:00.000Z|2099-01-01T00:00:00.000Z|9999999999999").toString(
    "base64url",
  );
  assert.equal(verifyFormDigestToken(`${tamperedPayload}.${signature}`), null);
});

test("verifyFormDigestToken — jeton malformé refusé", () => {
  assert.equal(verifyFormDigestToken(""), null);
  assert.equal(verifyFormDigestToken("pas-un-jeton-valide"), null);
});
