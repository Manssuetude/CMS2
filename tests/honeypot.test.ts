import assert from "node:assert/strict";
import test from "node:test";
import { isHoneypotFilled, HONEYPOT_FIELD_NAME } from "../src/lib/honeypot.ts";

test("isHoneypotFilled — vide ou absent → false", () => {
  assert.equal(isHoneypotFilled(new FormData()), false);
  const fd = new FormData();
  fd.set(HONEYPOT_FIELD_NAME, "");
  assert.equal(isHoneypotFilled(fd), false);
  const fdSpaces = new FormData();
  fdSpaces.set(HONEYPOT_FIELD_NAME, "   ");
  assert.equal(isHoneypotFilled(fdSpaces), false);
});

test("isHoneypotFilled — rempli → true", () => {
  const fd = new FormData();
  fd.set(HONEYPOT_FIELD_NAME, "http://spam.example");
  assert.equal(isHoneypotFilled(fd), true);
});
