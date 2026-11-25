import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { convertDocxToHtml, distributeNotes, resolveBookmarks, type DocxImage } from "../src/utils/docxImport.ts";
import { splitIntoParts } from "../src/utils/articleParts.ts";

// Fixture générée avec pandoc : titre de document (style « Title »), deux
// « Heading 1 », un « Heading 2 », un « Heading 3 », une liste, une image PNG
// et deux notes de bas de page (une par partie).
const fixture = readFileSync(new URL("./fixtures/article-test.docx", import.meta.url));

async function convert() {
  const uploaded: DocxImage[] = [];
  const result = await convertDocxToHtml(fixture, async (image, index) => {
    uploaded.push(image);
    return `https://cdn.test/import-${index}.${image.extension}`;
  });
  return { ...result, uploaded };
}

test("convertDocxToHtml — titres : Titre 1 → h2, Titre 2 → h3, Titre 3 → h4, titre du document ignoré", async () => {
  const { html } = await convert();
  assert.match(html, /<h2 id="resume">Résumé<\/h2>/);
  assert.match(html, /<h2 [^>]*>Le problème de l’intégration a changé<\/h2>/);
  assert.match(html, /<h3 [^>]*>Un premier sous-titre<\/h3>/);
  assert.match(html, /<h4 [^>]*>Un petit titre<\/h4>/);
  assert.doesNotMatch(html, /<h1/);
  assert.doesNotMatch(html, /Produire ensemble/);
});

test("convertDocxToHtml — liste conservée", async () => {
  const { html } = await convert();
  assert.match(html, /<ul><li>premier point<\/li><li>second point<\/li><\/ul>/);
});

test("convertDocxToHtml — image téléversée, src remplacée, jamais de base64", async () => {
  const { html, uploaded, imageCount } = await convert();
  assert.equal(uploaded.length, 1);
  assert.equal(imageCount, 1);
  assert.equal(uploaded[0].contentType, "image/png");
  assert.ok(uploaded[0].bytes.length > 0);
  assert.match(html, /<img [^>]*src="https:\/\/cdn\.test\/import-0\.png"/);
  assert.match(html, /alt="Graphique des échanges"/);
  assert.doesNotMatch(html, /data:image/);
});

test("convertDocxToHtml — image en échec : retirée du corps, avertissement", async () => {
  const result = await convertDocxToHtml(fixture, async () => {
    throw new Error("réseau");
  });
  assert.doesNotMatch(result.html, /<img/);
  assert.ok(result.warnings.some((w) => /Image 1 non importée/.test(w)));
});

test("convertDocxToHtml — nombre de notes renvoyé (étape « Vérifier » de l'import)", async () => {
  const { noteCount } = await convert();
  assert.equal(noteCount, 2);
});

test("convertDocxToHtml — notes de bas de page rangées à la fin de leur partie", async () => {
  const { html } = await convert();
  const parts = splitIntoParts(html);
  assert.deepEqual(
    parts.map((p) => p.title),
    ["Introduction", "Résumé", "Le problème de l’intégration a changé"],
  );
  const [, resume, probleme] = parts;
  assert.match(resume.html, /<sup class="footnote-ref"><a href="#(footnote-\d+)" id="footnote-ref-\d+">1<\/a><\/sup>/);
  assert.match(resume.html, /<div class="footnotes">[\s\S]*Première note de bas de page/);
  assert.doesNotMatch(resume.html, /Seconde note/);
  assert.match(
    probleme.html,
    /<p class="footnote" id="footnote-\d+"><a class="footnote-back" href="#footnote-ref-\d+">2\.<\/a> Seconde note, <em>en italique<\/em>/,
  );
  // Plus de flèche « ↑ » ni de liste de notes globale en fin de document.
  assert.doesNotMatch(html, /↑/);
});

test("distributeNotes — note jamais appelée : placée en fin d'article", () => {
  const html =
    '<h2>Un</h2><p>x</p><h2>Deux</h2><p>y</p><ol><li id="footnote-3"><p>Orpheline <a href="#footnote-ref-3">↑</a></p></li></ol>';
  const out = distributeNotes(html);
  assert.match(out, /<h2>Deux<\/h2><p>y<\/p><div class="footnotes">[\s\S]*Orpheline/);
});

test("distributeNotes — sans notes : liste vide retirée, contenu intact", () => {
  assert.equal(distributeNotes("<h2>Un</h2><p>x</p><ol></ol>"), "<h2>Un</h2><p>x</p>");
});

test("resolveBookmarks — signet visé par un lien reporté sur le titre, les autres retirés", () => {
  const html =
    '<p><a href="#_Toc1">Voir</a></p><a id="_GoBack"></a><a id="_Toc1"></a><h2>Titre</h2><p>a<a id="_x"></a></p>';
  assert.equal(resolveBookmarks(html), '<p><a href="#_Toc1">Voir</a></p><h2 id="_Toc1">Titre</h2><p>a</p>');
});
