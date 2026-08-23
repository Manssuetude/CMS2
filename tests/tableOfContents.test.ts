import assert from "node:assert/strict";
import test from "node:test";
import { fixTableOfContentsLinks, extractHeadings } from "../src/utils/tableOfContents.ts";

test("fixTableOfContentsLinks — retire un lien Google Docs qui duplique un titre (le sommaire auto s'en charge)", () => {
  const html =
    '<a href="https://docs.google.com/document/d/abc/edit#heading=h.xyz">Introduction        5</a>' +
    "<h2>Introduction</h2>";
  const out = fixTableOfContentsLinks(html);
  assert.match(out, /<h2 id="introduction">Introduction<\/h2>/);
  assert.doesNotMatch(out, /<a\b/);
});

test("fixTableOfContentsLinks — retire le paragraphe devenu vide après le retrait d'une entrée de sommaire", () => {
  const html =
    '<p><a href="https://docs.google.com/document/d/abc/edit#heading=h.xyz">Introduction        5</a></p>' +
    "<h2>Introduction</h2>";
  const out = fixTableOfContentsLinks(html);
  assert.doesNotMatch(out, /<a\b/);
  assert.doesNotMatch(out, /<p>\s*<\/p>/);
  assert.match(out, /<h2 id="introduction">Introduction<\/h2>/);
});

test("fixTableOfContentsLinks — neutralise un lien externe sans titre correspondant", () => {
  const html = '<a href="https://docs.google.com/document/d/abc/edit#heading=h.xyz">Section fantôme</a>';
  const out = fixTableOfContentsLinks(html);
  assert.equal(out, "Section fantôme");
});

test("fixTableOfContentsLinks — laisse intacts les liens normaux", () => {
  const html = '<a href="https://example.com">Un lien normal</a><h2>Titre</h2>';
  const out = fixTableOfContentsLinks(html);
  assert.match(out, /<a href="https:\/\/example\.com">Un lien normal<\/a>/);
  assert.match(out, /<h2 id="titre">Titre<\/h2>/);
});

test("fixTableOfContentsLinks — ignore la numérotation de section absente du titre réel", () => {
  const html =
    '<a href="https://docs.google.com/document/d/abc/edit#heading=h.xyz">I. INTRODUCTION        5</a>' +
    "<h1><strong><u>INTRODUCTION</u></strong></h1>";
  const out = fixTableOfContentsLinks(html);
  assert.match(out, /<h2 id="introduction"><strong><u>INTRODUCTION<\/u><\/strong><\/h2>/);
  assert.doesNotMatch(out, /<a\b/);
});

test("fixTableOfContentsLinks — désambiguïse les titres en doublon", () => {
  const html = "<h2>Contexte</h2><h2>Contexte</h2>";
  const out = fixTableOfContentsLinks(html);
  assert.match(out, /<h2 id="contexte">Contexte<\/h2><h2 id="contexte-2">Contexte<\/h2>/);
});

test("extractHeadings — récupère les h2/h3 avec id, ignore les h4", () => {
  const html = fixTableOfContentsLinks(
    "<h2>Introduction</h2><p>...</p><h3>Contexte</h3><h4>Détail</h4><h2>Conclusion</h2>",
  );
  const headings = extractHeadings(html);
  assert.deepEqual(headings, [
    { id: "introduction", label: "Introduction", level: 2 },
    { id: "contexte", label: "Contexte", level: 3 },
    { id: "conclusion", label: "Conclusion", level: 2 },
  ]);
});

test("extractHeadings — ignore les titres sans id", () => {
  const headings = extractHeadings("<h2>Sans id</h2>");
  assert.deepEqual(headings, []);
});

test("extractHeadings — nettoie le balisage interne du titre", () => {
  const html = fixTableOfContentsLinks("<h2><strong><u>Contexte</u></strong></h2>");
  const headings = extractHeadings(html);
  assert.deepEqual(headings, [{ id: "contexte", label: "Contexte", level: 2 }]);
});
