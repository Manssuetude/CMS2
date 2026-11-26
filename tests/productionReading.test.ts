import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { splitIntoParts } from "../src/utils/articleParts.ts";
import { productionReadingMode } from "../src/utils/productionReading.ts";

const ROOT = new URL("..", import.meta.url).pathname;
const read = (path: string) => readFileSync(join(ROOT, path), "utf8");

function sourceFiles(dir: string): string[] {
  return readdirSync(join(ROOT, dir)).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(join(ROOT, path)).isDirectory()) return sourceFiles(path);
    return /\.(tsx?|mjs|css)$/.test(name) ? [path] : [];
  });
}

const PDF_URL = "https://exemple.org/storage/article.pdf";

test("page production — avec texte : lecture par parties", () => {
  const parts = splitIntoParts("<p>Introduction.</p><h2>Contexte</h2><p>Texte de la partie.</p>", {
    basePath: "/productions/essai",
  });
  assert.ok(parts.length > 0);
  assert.equal(productionReadingMode(parts.length, PDF_URL), "parts");
  assert.equal(productionReadingMode(parts.length, null), "parts");
});

test("page production — sans texte avec PDF : page de secours avec téléchargement", () => {
  assert.equal(productionReadingMode(0, PDF_URL), "pdf");
});

test("page production — sans texte ni PDF : page de secours, chapô seul", () => {
  assert.equal(productionReadingMode(0, null), "standfirst");
  assert.equal(productionReadingMode(0, undefined), "standfirst");
  assert.equal(productionReadingMode(0, ""), "standfirst");
});

test("page production — ArticleReader : encadré PDF seulement en mode « pdf », bandeau seulement avec un PDF", () => {
  const reader = read("src/components/public/ArticleReader.tsx");
  assert.match(reader, /productionReadingMode\(parts\.length, pdfHref\)/);
  assert.match(reader, /mode === "pdf" && \(\s*<div className="article-pdf-notice">/);
  assert.match(reader, /Cet article est disponible en PDF/);
  assert.match(reader, /\{downloadHref && \(\s*<section className="article-pdf-band"/);
  // Téléchargement direct : plus d'ouverture dans un onglet ni d'URL du Storage.
  assert.doesNotMatch(reader, /target="_blank"/);
  // L'URL du fichier n'est jamais transmise au composant public (seulement pdfHref).
  assert.doesNotMatch(reader, /fileUrl/);
  assert.doesNotMatch(reader, /—/, "pas de tiret cadratin dans les textes affichés");
});

test("pages production — un seul affichage : ArticleReader", () => {
  for (const page of [
    "src/app/(public)/productions/[slug]/page.tsx",
    "src/app/(public)/productions/[slug]/[partie]/page.tsx",
  ]) {
    const source = read(page);
    assert.match(source, /<ArticleReader /, page);
    assert.doesNotMatch(source, /ProductionDetail/, page);
  }
});

test("liseuse PDF retirée : plus de PdfViewer, ProductionDetail ni react-pdf", () => {
  const offenders = sourceFiles("src").filter((path) =>
    /PdfViewer|ProductionDetail|react-pdf|pdf-viewer/.test(read(path)),
  );
  assert.deepEqual(offenders, []);
  const pkg = JSON.parse(read("package.json")) as { dependencies?: Record<string, string> };
  assert.equal(pkg.dependencies?.["react-pdf"], undefined);
  assert.ok(pkg.dependencies?.["pdfjs-dist"], "pdfjs-dist sert au comptage des pages dans l'admin");
});

test("pages publiques production — brouillons et archives non servis", () => {
  const service = read("src/services/productionReadingService.ts");
  // La page et le téléchargement ne chargent que des productions publiées.
  assert.match(service, /loadProductionPage = cache\(async[^]*?getPublishedProduction\(slug\)/);
  assert.match(service, /getProductionPdfDownload[^]*?getPublishedProduction\(slug\)/);
  const repository = read("src/repositories/productionRepository.ts");
  assert.match(repository, /getPublishedProduction[^]*?\.eq\("status", "published"\)/);
  // Pas de pré-génération des brouillons.
  const page = read("src/app/(public)/productions/[slug]/page.tsx");
  assert.doesNotMatch(page, /listProductions\(true\)/);
  // « Voir sur le site » seulement pour une production publiée (sinon : Aperçu).
  const edit = read("src/app/admin/productions/[id]/edit/page.tsx");
  assert.match(edit, /publicHref=\{item\.status === "published"/);
});
