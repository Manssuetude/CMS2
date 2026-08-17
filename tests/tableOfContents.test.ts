import assert from "node:assert/strict";
import test from "node:test";
import { fixTableOfContentsLinks } from "../src/utils/tableOfContents.ts";

test("fixTableOfContentsLinks — réécrit un lien Google Docs vers l'ancre du titre correspondant", () => {
  const html =
    '<a href="https://docs.google.com/document/d/abc/edit#heading=h.xyz">Introduction        5</a>' +
    "<h2>Introduction</h2>";
  const out = fixTableOfContentsLinks(html);
  assert.match(out, /<h2 id="introduction">Introduction<\/h2>/);
  assert.match(out, /<a href="#introduction">Introduction {8}5<\/a>/);
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
  assert.match(out, /<a href="#introduction">I\. INTRODUCTION {8}5<\/a>/);
});

test("fixTableOfContentsLinks — désambiguïse les titres en doublon", () => {
  const html = "<h2>Contexte</h2><h2>Contexte</h2>";
  const out = fixTableOfContentsLinks(html);
  assert.match(out, /<h2 id="contexte">Contexte<\/h2><h2 id="contexte-2">Contexte<\/h2>/);
});
