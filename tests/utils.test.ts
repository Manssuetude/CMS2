import assert from "node:assert/strict";
import test from "node:test";
import { parseTags, uniqueTags } from "../src/utils/tags.ts";
import { asString, asNullableString, asBoolean, asStringArray, asRecord, asRecordArray } from "../src/utils/row.ts";

test("parseTags — découpe, trim, ignore le vide", () => {
  assert.deepEqual(parseTags("a, b ,, c "), ["a", "b", "c"]);
  assert.deepEqual(parseTags(""), []);
  assert.deepEqual(parseTags(null), []);
  assert.deepEqual(parseTags(undefined), []);
});

test("uniqueTags — dédoublonne et trim", () => {
  assert.deepEqual(uniqueTags(["a", "a ", " b", "b", ""]), ["a", "b"]);
});

test("row.asString — fallback si non-string", () => {
  assert.equal(asString("x"), "x");
  assert.equal(asString(42), "");
  assert.equal(asString(null, "def"), "def");
});

test("row.asNullableString", () => {
  assert.equal(asNullableString("x"), "x");
  assert.equal(asNullableString(3), null);
});

test("row.asBoolean", () => {
  assert.equal(asBoolean(true), true);
  assert.equal(asBoolean("true"), false);
  assert.equal(asBoolean(undefined, true), true);
});

test("row.asStringArray — ne garde que les strings", () => {
  assert.deepEqual(asStringArray(["a", 1, "b", null]), ["a", "b"]);
  assert.deepEqual(asStringArray("nope"), []);
});

test("row.asRecord — objet uniquement", () => {
  assert.deepEqual(asRecord({ a: 1 }), { a: 1 });
  assert.deepEqual(asRecord([1, 2]), {});
  assert.deepEqual(asRecord(null), {});
});

test("row.asRecordArray — filtre les entrées qui ne sont pas des objets", () => {
  assert.deepEqual(asRecordArray([{ name: "A" }, "nope", 1, null, { name: "B" }]), [{ name: "A" }, { name: "B" }]);
  assert.deepEqual(asRecordArray("not an array"), []);
  assert.deepEqual(asRecordArray(undefined), []);
});
