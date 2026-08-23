import assert from "node:assert/strict";
import test from "node:test";
import { sanitizeHtml } from "../src/utils/sanitizeHtml.ts";

test("sanitizeHtml — retire les balises script", () => {
  const out = sanitizeHtml("<p>ok</p><script>alert(1)</script>");
  assert.ok(out.includes("<p>ok</p>"));
  assert.ok(!out.toLowerCase().includes("<script"));
});

test("sanitizeHtml — retire les handlers inline (onerror/onclick)", () => {
  const out = sanitizeHtml('<img src=x onerror="alert(1)"><button onclick="x()">y</button>');
  assert.ok(!out.toLowerCase().includes("onerror"));
  assert.ok(!out.toLowerCase().includes("onclick"));
});

test("sanitizeHtml — retire tout attribut on* (pas seulement onerror/onclick), et formaction", () => {
  const out = sanitizeHtml(
    '<div onmouseover="x()" onfocus="y()" onanimationstart="z()">t</div><button formaction="javascript:alert(1)">b</button>',
  );
  assert.ok(!out.toLowerCase().includes("onmouseover"));
  assert.ok(!out.toLowerCase().includes("onfocus"));
  assert.ok(!out.toLowerCase().includes("onanimationstart"));
  assert.ok(!out.toLowerCase().includes("formaction"));
});

test("sanitizeHtml — conserve le formatage riche légitime", () => {
  const out = sanitizeHtml('<h2>Titre</h2><p><strong>gras</strong> et <a href="/x">lien</a></p><ul><li>a</li></ul>');
  assert.match(out, /<h2[^>]*>Titre<\/h2>/);
  assert.ok(out.includes("<strong>"));
  assert.ok(out.includes("<li>"));
});

test("sanitizeHtml — valeur vide/nulle → chaîne vide", () => {
  assert.equal(sanitizeHtml(null), "");
  assert.equal(sanitizeHtml(undefined), "");
  assert.equal(sanitizeHtml(""), "");
});

test("sanitizeHtml — neutralise les URLs javascript: (XSS via lien/image)", () => {
  const out = sanitizeHtml('<a href="javascript:alert(1)">clic</a><img src="javascript:alert(2)">');
  assert.ok(!out.toLowerCase().includes("javascript:"));
});

test("sanitizeHtml — conserve les images en data URI (captures collées depuis Google Docs/Word)", () => {
  const out = sanitizeHtml('<img src="data:image/png;base64,iVBORw0KGgo=">');
  assert.ok(out.includes('src="data:image/png;base64,iVBORw0KGgo="'));
});

test("sanitizeHtml — retire style/iframe/object/embed/form", () => {
  const out = sanitizeHtml(
    '<style>body{}</style><iframe src="//evil"></iframe><object></object><embed src="x"><form></form><p>ok</p>',
  );
  assert.ok(!out.toLowerCase().includes("<style"));
  assert.ok(!out.toLowerCase().includes("<iframe"));
  assert.ok(!out.toLowerCase().includes("<object"));
  assert.ok(!out.toLowerCase().includes("<embed"));
  assert.ok(!out.toLowerCase().includes("<form"));
  assert.ok(out.includes("<p>ok</p>"));
});
