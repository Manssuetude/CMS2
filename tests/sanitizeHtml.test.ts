import assert from "node:assert/strict";
import test from "node:test";
import { sanitizeHtml } from "../src/utils/sanitizeHtml.ts";

test("sanitizeHtml — retire les balises script", () => {
  const out = sanitizeHtml('<p>ok</p><script>alert(1)</script>');
  assert.ok(out.includes("<p>ok</p>"));
  assert.ok(!out.toLowerCase().includes("<script"));
});

test("sanitizeHtml — retire les handlers inline (onerror/onclick)", () => {
  const out = sanitizeHtml('<img src=x onerror="alert(1)"><button onclick="x()">y</button>');
  assert.ok(!out.toLowerCase().includes("onerror"));
  assert.ok(!out.toLowerCase().includes("onclick"));
});

test("sanitizeHtml — conserve le formatage riche légitime", () => {
  const out = sanitizeHtml("<h2>Titre</h2><p><strong>gras</strong> et <a href=\"/x\">lien</a></p><ul><li>a</li></ul>");
  assert.ok(out.includes("<h2>"));
  assert.ok(out.includes("<strong>"));
  assert.ok(out.includes("<li>"));
});

test("sanitizeHtml — valeur vide/nulle → chaîne vide", () => {
  assert.equal(sanitizeHtml(null), "");
  assert.equal(sanitizeHtml(undefined), "");
  assert.equal(sanitizeHtml(""), "");
});
