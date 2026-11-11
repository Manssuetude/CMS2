import assert from "node:assert/strict";
import test from "node:test";
import {
  CONSENT_MAX_AGE_DAYS,
  cookieDomainCandidates,
  gaCookieNames,
  parseStoredConsent,
  readStoredConsent,
  writeStoredConsent,
} from "../src/lib/consent.ts";

test("readStoredConsent — pas de window (SSR) → null, ne plante pas", () => {
  assert.equal(readStoredConsent(), null);
});

test("writeStoredConsent — pas de window (SSR) → no-op, ne plante pas", () => {
  assert.doesNotThrow(() => writeStoredConsent("accepted"));
});

test("parseStoredConsent — choix daté valide", () => {
  const now = new Date("2026-11-11T12:00:00Z");
  const raw = JSON.stringify({ value: "accepted", date: "2026-10-01T09:00:00.000Z" });
  assert.deepEqual(parseStoredConsent(raw, now), { value: "accepted", date: "2026-10-01T09:00:00.000Z" });
});

test("parseStoredConsent — redemandé après 6 mois", () => {
  const now = new Date("2026-11-11T12:00:00Z");
  const old = new Date(now.getTime() - (CONSENT_MAX_AGE_DAYS + 1) * 86_400_000).toISOString();
  assert.equal(parseStoredConsent(JSON.stringify({ value: "declined", date: old }), now), null);
  const recent = new Date(now.getTime() - (CONSENT_MAX_AGE_DAYS - 1) * 86_400_000).toISOString();
  assert.equal(parseStoredConsent(JSON.stringify({ value: "declined", date: recent }), now)?.value, "declined");
});

test("parseStoredConsent — ancien format (sans date), illisible ou invalide → redemander", () => {
  assert.equal(parseStoredConsent("accepted"), null);
  assert.equal(parseStoredConsent("{pas du json"), null);
  assert.equal(parseStoredConsent(JSON.stringify({ value: "peut-être", date: new Date().toISOString() })), null);
  assert.equal(parseStoredConsent(JSON.stringify({ value: "accepted" })), null);
  assert.equal(parseStoredConsent(null), null);
});

test("parseStoredConsent — date dans le futur refusée", () => {
  const now = new Date("2026-11-11T12:00:00Z");
  assert.equal(parseStoredConsent(JSON.stringify({ value: "accepted", date: "2027-01-01T00:00:00Z" }), now), null);
});

test("gaCookieNames — ne garde que les cookies Google Analytics", () => {
  assert.deepEqual(gaCookieNames("_ga=GA1.1.123; ms-theme=dark; _ga_5TJZEVV0G9=GS1.1; _gid=x; galerie=1"), [
    "_ga",
    "_ga_5TJZEVV0G9",
    "_gid",
  ]);
  assert.deepEqual(gaCookieNames(""), []);
});

test("cookieDomainCandidates — hôte exact et domaines parents", () => {
  assert.deepEqual(cookieDomainCandidates("www.manssuetude.com"), ["", ".www.manssuetude.com", ".manssuetude.com"]);
  assert.deepEqual(cookieDomainCandidates("localhost"), [""]);
});
