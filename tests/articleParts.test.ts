import assert from "node:assert/strict";
import test from "node:test";
import {
  buildPartsMenu,
  partMenuHeadings,
  partPath,
  readingPercent,
  splitIntoParts,
} from "../src/utils/articleParts.ts";

test("splitIntoParts — contenu vide : aucune partie", () => {
  assert.deepEqual(splitIntoParts(null), []);
  assert.deepEqual(splitIntoParts("<p>  </p>"), []);
});

test("splitIntoParts — aucun h2 : une seule partie, contenu complet conservé", () => {
  const parts = splitIntoParts("<h3>Contexte</h3><p>Un texte court.</p>");
  assert.equal(parts.length, 1);
  assert.equal(parts[0].isIntro, true);
  assert.match(parts[0].html, /<h3 id="contexte">Contexte<\/h3>/);
  assert.match(parts[0].html, /Un texte court/);
});

test("splitIntoParts — chaque h2 ouvre une partie, titre et slug depuis le h2", () => {
  const parts = splitIntoParts("<h2>Résumé</h2><p>A</p><h2>I. Une intégration par morceaux</h2><p>B</p>");
  assert.deepEqual(
    parts.map((p) => [p.slug, p.title]),
    [
      ["resume", "Résumé"],
      ["i-une-integration-par-morceaux", "I. Une intégration par morceaux"],
    ],
  );
  assert.equal(parts[0].html, "<p>A</p>");
  assert.doesNotMatch(parts[1].html, /<h2/);
  assert.equal(parts[1].index, 1);
});

test("splitIntoParts — contenu avant le premier h2 : partie d'introduction", () => {
  const parts = splitIntoParts("<p>Chapeau</p><h2>Suite</h2><p>B</p>");
  assert.equal(parts.length, 2);
  assert.equal(parts[0].title, "Introduction");
  assert.equal(parts[0].slug, "introduction");
  assert.equal(parts[0].isIntro, true);
  assert.equal(parts[0].html, "<p>Chapeau</p>");
});

test("splitIntoParts — introduction titrée par le premier titre rencontré (retiré du corps s'il l'ouvre)", () => {
  const parts = splitIntoParts("<h3>Avant-propos</h3><p>Chapeau</p><h2>Suite</h2><p>B</p>");
  assert.equal(parts[0].title, "Avant-propos");
  assert.equal(parts[0].html, "<p>Chapeau</p>");
});

test("splitIntoParts — introduction vide (espaces, paragraphes vides) : pas de partie d'introduction", () => {
  const parts = splitIntoParts("<p>&nbsp;</p>\n<h2>Résumé</h2><p>A</p>");
  assert.equal(parts.length, 1);
  assert.equal(parts[0].title, "Résumé");
});

test("splitIntoParts — titres en double : slugs dédoublonnés", () => {
  const parts = splitIntoParts("<h2>Notes</h2><p>A</p><h2>Notes</h2><p>B</p><h2>Notes</h2><p>C</p>");
  assert.deepEqual(
    parts.map((p) => p.slug),
    ["notes", "notes-2", "notes-3"],
  );
});

test("splitIntoParts — les h3/h4 restent dans leur partie et alimentent son sommaire (h3 seulement)", () => {
  const parts = splitIntoParts(
    "<h2>Un</h2><h3>A</h3><p>x</p><h4>A.1</h4><p>y</p><h3>B</h3><h2>Deux</h2><h3>C</h3><p>z</p>",
  );
  assert.equal(parts.length, 2);
  assert.match(parts[0].html, /<h4 id="[^"]+">A.1<\/h4>/);
  assert.deepEqual(
    parts[0].headings.map((h) => h.label),
    ["A", "B"],
  );
  assert.deepEqual(
    parts[1].headings.map((h) => h.label),
    ["C"],
  );
});

test("splitIntoParts — un h2 imbriqué dans une liste ou un tableau ne coupe pas la partie", () => {
  const parts = splitIntoParts("<h2>Un</h2><blockquote><h2>Citation</h2><p>x</p></blockquote><p>y</p>");
  // Le <h2> collé dans un bloc reste dans la partie (pas de HTML déséquilibré).
  assert.equal(parts.length, 1);
  assert.match(parts[0].html, /<blockquote>[\s\S]*<\/blockquote><p>y<\/p>/);
});

test("splitIntoParts — liens internes vers une ancre d'une autre partie : URL de la partie", () => {
  const html =
    '<h2>Un</h2><p>Voir <a href="#deux">plus bas</a> et <a href="#note-1">note</a> et <a href="#local">ici</a>.</p><p id="local">L</p>' +
    '<h2>Deux</h2><p>Retour <a href="#un">au début</a>.</p><p id="note-1">Note</p>';
  const parts = splitIntoParts(html, { basePath: "/productions/article" });
  assert.match(parts[0].html, /href="\/productions\/article\/deux#deux"/);
  assert.match(parts[0].html, /href="\/productions\/article\/deux#note-1"/);
  assert.match(parts[0].html, /href="#local"/);
  // La première partie est servie sur l'URL de l'article lui-même.
  assert.match(parts[1].html, /href="\/productions\/article#un"/);
});

test("splitIntoParts — sans basePath, les liens internes ne sont pas réécrits", () => {
  const parts = splitIntoParts('<h2>Un</h2><p><a href="#deux">x</a></p><h2>Deux</h2>');
  assert.match(parts[0].html, /href="#deux"/);
});

test("splitIntoParts — HTML collé depuis Google Docs (conteneur <b id=docs-internal-guid>)", () => {
  const html =
    '<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-abc">' +
    '<p dir="ltr"><span>Intro collée</span></p>' +
    '<h2 dir="ltr"><span>Première&nbsp;partie</span></h2><p dir="ltr"><span>A</span></p>' +
    '<h2 dir="ltr"><span>Seconde &amp; dernière</span></h2><p dir="ltr"><span>B</span></p></b><br>';
  const parts = splitIntoParts(html);
  assert.deepEqual(
    parts.map((p) => p.title),
    ["Introduction", "Première partie", "Seconde & dernière"],
  );
  assert.equal(parts[2].slug, "seconde-derniere");
  for (const part of parts) assert.doesNotMatch(part.html, /<\/b>|<b\b/);
  // Le style inline collé est retiré par sanitizeHtml.
  assert.doesNotMatch(parts[1].html, /style=/);
});

test("splitIntoParts — le HTML est nettoyé (sanitizeHtml)", () => {
  const parts = splitIntoParts('<h2>Un</h2><p onclick="x()">A</p><script>alert(1)</script>');
  assert.doesNotMatch(parts[0].html, /onclick|script/);
});

test("partPath — la première partie est servie sur l'URL de l'article", () => {
  const parts = [{ slug: "resume" }, { slug: "suite" }];
  assert.equal(partPath("/productions/a", parts, 0), "/productions/a");
  assert.equal(partPath("/productions/a", parts, 1), "/productions/a/suite");
});

test("readingPercent — début, milieu, fin de lecture, pondéré par la longueur des parties", () => {
  const weights = [100, 300, 600];
  assert.equal(readingPercent(weights, 0, 0), 0);
  assert.equal(readingPercent(weights, 1, 0), 10);
  assert.equal(readingPercent(weights, 1, 0.5), 25);
  assert.equal(readingPercent(weights, 2, 0), 40);
  assert.equal(readingPercent(weights, 2, 1), 100);
});

test("readingPercent — poids nuls, fraction et index hors bornes", () => {
  assert.equal(readingPercent([], 0, 0.5), 0);
  assert.equal(readingPercent([0, 0], 1, 1), 0);
  assert.equal(readingPercent([0, 50, 50], 1, 1), 50);
  assert.equal(readingPercent([100, 100], 0, 2), 50);
  assert.equal(readingPercent([100, 100], 0, -1), 0);
  assert.equal(readingPercent([100, 100], 9, 1), 100);
  assert.equal(readingPercent([100, 100], 0, Number.NaN), 0);
});

test("splitIntoParts — partie sans texte (seulement une image) : fusionnée avec la suivante", () => {
  const parts = splitIntoParts(
    '<p><img src="https://x.test/logo.png" alt="Logo"></p><p>&nbsp;</p><h2>Résumé</h2><p>A</p>',
  );
  assert.equal(parts.length, 1);
  assert.equal(parts[0].title, "Résumé");
  assert.match(parts[0].html, /^<p><img src="https:\/\/x\.test\/logo\.png"/);
  assert.match(parts[0].html, /<p>A<\/p>$/);
});

test("splitIntoParts — titre de partie sans contenu : fusionné avec la suivante, dernière partie vide rattachée à la précédente", () => {
  const parts = splitIntoParts(
    '<h2>Vide</h2><h2>Un</h2><p>A</p><h2>Deux</h2><p>B</p><h2>Annexe</h2><p><img src="https://x.test/a.png" alt="A"></p>',
  );
  assert.deepEqual(
    parts.map((p) => p.title),
    ["Un", "Deux"],
  );
  assert.match(parts[1].html, /<p>B<\/p><p><img/);
});

test("splitIntoParts — h2 sans texte (logo en titre) : n'ouvre pas de partie, le contenu d'avant s'appelle « Introduction »", () => {
  const parts = splitIntoParts(
    '<h2><strong><img src="https://x.test/logo.png" alt="Logo"></strong></h2><p>Chapeau</p><h2>Suite</h2><p>B</p>',
  );
  assert.deepEqual(
    parts.map((p) => p.title),
    ["Introduction", "Suite"],
  );
  assert.equal(parts[0].isIntro, true);
  assert.match(parts[0].html, /logo\.png/);
  assert.match(parts[0].html, /Chapeau/);
});

test("splitIntoParts — poids de lecture = longueur du texte sans balises", () => {
  const parts = splitIntoParts("<h2>Un</h2><p>abc <strong>de</strong></p><h2>Deux</h2><p>abcdefghij</p>");
  assert.deepEqual(
    parts.map((p) => p.weight),
    [6, 10],
  );
});

test("splitIntoParts — sous-titres h3 avec id, uniques dans la page", () => {
  const parts = splitIntoParts(
    "<h2>Focus</h2><p>A</p><h3>Cameroun</h3><p>B</p><h3>Congo</h3><p>C</p><h3>Cameroun</h3><p>D</p><h4>Détail</h4>",
  );
  const ids = parts[0].headings.map((h) => h.id);
  assert.deepEqual(
    parts[0].headings.map((h) => h.label),
    ["Cameroun", "Congo", "Cameroun"],
  );
  assert.ok(ids.every(Boolean));
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ids) assert.match(parts[0].html, new RegExp(`<h3 id="${id}">`));
});

test("menu — sous-titre identique au titre de la partie masqué (casse, espaces, ponctuation)", () => {
  const headings = partMenuHeadings({
    title: "V. Grille d’analyse des œuvres",
    headings: [
      { id: "a", label: "Grille d'analyse des oeuvres", level: 3 },
      { id: "c", label: "GRILLE D’ANALYSE  DES ŒUVRES !", level: 3 },
      { id: "b", label: "Critères", level: 3 },
    ],
  });
  assert.deepEqual(headings, [{ id: "b", label: "Critères" }]);
  // Un sous-titre qui ne fait que commencer comme le titre reste affiché.
  assert.equal(
    partMenuHeadings({ title: "II. Méthode", headings: [{ id: "m", label: "Méthode et sources", level: 3 }] }).length,
    1,
  );
});

test("menu — seule la partie ouverte déplie ses sous-titres", () => {
  const parts = splitIntoParts(
    "<h2>Un</h2><p>A</p><h3>Sous un</h3><p>B</p><h2>Deux</h2><p>C</p><h3>Sous deux</h3><p>D</p>",
  );
  const menu = buildPartsMenu(parts, 1, "/productions/x");
  assert.deepEqual(
    menu.map((m) => [m.href, m.headings.map((h) => h.label)]),
    [
      ["/productions/x", []],
      ["/productions/x/deux", ["Sous deux"]],
    ],
  );
});
