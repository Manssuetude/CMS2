import assert from "node:assert/strict";
import test from "node:test";
import { readStoredConsent, writeStoredConsent } from "../src/lib/consent.ts";

test("readStoredConsent — pas de window (SSR) → null, ne plante pas", () => {
  assert.equal(readStoredConsent(), null);
});

test("writeStoredConsent — pas de window (SSR) → no-op, ne plante pas", () => {
  assert.doesNotThrow(() => writeStoredConsent("accepted"));
});
