import assert from "node:assert/strict";
import test from "node:test";
import { readingPercent } from "../src/utils/articleParts.ts";
import {
  pdfDownloadFileName,
  pdfDownloadUrl,
  productionDownloadPath,
  resolveProductionDownload,
} from "../src/utils/productionDownload.ts";
import { parseReadingMinutes, readingMinutes, remainingReadingLabel } from "../src/utils/readingTime.ts";
import { readingToolBlocks } from "../src/utils/readingTools.ts";

const STORAGE = "https://abc.supabase.co/storage/v1/object/public/media/1700000000-perspective.pdf";

// ── Temps de lecture restant ─────────────────────────────────────────────

test("temps restant — début, milieu et fin d'un article en plusieurs parties", () => {
  const weights = [1000, 3000, 1000];
  // Rendu serveur, partie 1 : temps total de la partie en cours et des suivantes.
  assert.equal(remainingReadingLabel(20, readingPercent(weights, 0, 0)), "environ 20 min");
  // Début de la partie 2 : 1000/5000 lus → 80 % restants.
  assert.equal(remainingReadingLabel(20, readingPercent(weights, 1, 0)), "environ 16 min");
  // Milieu de l'article.
  assert.equal(remainingReadingLabel(20, readingPercent(weights, 1, 0.5)), "environ 10 min");
  // Fin : bas de la dernière partie.
  assert.equal(remainingReadingLabel(20, readingPercent(weights, 2, 1)), "Lecture terminée");
  assert.equal(remainingReadingLabel(20, 97), "moins d'une minute");
});

test("temps restant — article d'une seule partie", () => {
  assert.equal(remainingReadingLabel(7, readingPercent([4200], 0, 0)), "environ 7 min");
  assert.equal(remainingReadingLabel(7, readingPercent([4200], 0, 0.5)), "environ 4 min");
  assert.equal(remainingReadingLabel(7, readingPercent([4200], 0, 1)), "Lecture terminée");
});

test("temps restant — valeurs hors bornes", () => {
  assert.equal(remainingReadingLabel(10, -20), "environ 10 min");
  assert.equal(remainingReadingLabel(10, Number.NaN), "environ 10 min");
  assert.equal(remainingReadingLabel(10, 250), "Lecture terminée");
});

test("durée totale — saisie à la main ou estimée sur le texte", () => {
  assert.equal(parseReadingMinutes("12 min"), 12);
  assert.equal(parseReadingMinutes("15"), 15);
  assert.equal(parseReadingMinutes("1 h 05"), 65);
  assert.equal(parseReadingMinutes(""), null);
  assert.equal(parseReadingMinutes("quelques minutes"), null);
  assert.equal(readingMinutes(`<p>${"mot ".repeat(1000)}</p>`), 5);
  assert.equal(readingMinutes(""), null);
});

// ── Colonne outils ───────────────────────────────────────────────────────

test("colonne outils — PDF, temps restant, partager, citer", () => {
  assert.deepEqual(readingToolBlocks({ pdfHref: productionDownloadPath("essai"), totalMinutes: 12 }), [
    "pdf",
    "time",
    "share",
    "cite",
  ]);
});

test("colonne outils — sans PDF : pas de bouton de téléchargement", () => {
  assert.deepEqual(readingToolBlocks({ pdfHref: null, totalMinutes: 12 }), ["time", "share", "cite"]);
});

test("colonne outils — page de secours (sans texte) : pas de temps restant", () => {
  assert.deepEqual(readingToolBlocks({ pdfHref: "/productions/essai/telecharger", totalMinutes: null }), [
    "pdf",
    "share",
    "cite",
  ]);
  assert.deepEqual(readingToolBlocks({ pdfHref: null, totalMinutes: null }), ["share", "cite"]);
});

// ── Route /productions/[slug]/telecharger ────────────────────────────────

test("nom de fichier — titre court, accents gardés", () => {
  assert.equal(
    pdfDownloadFileName("Perspective N°2 : la souveraineté à l'épreuve des dépendances"),
    "Manssuétude - Perspective N°2.pdf",
  );
  assert.equal(
    pdfDownloadFileName("Juger l'œuvre, juger l'homme ? Comment une société décide"),
    "Manssuétude - Juger l'œuvre, juger l'homme.pdf",
  );
});

test("nom de fichier — caractères interdits retirés, longueur bornée", () => {
  assert.equal(pdfDownloadFileName('Rapport 2026/2027 "final" <v2>|*'), "Manssuétude - Rapport 2026 2027 final v2.pdf");
  assert.equal(pdfDownloadFileName("Ligne\u0000cachée\tici"), "Manssuétude - Ligne cachée ici.pdf");
  const long = pdfDownloadFileName(`${"Développement souverain ".repeat(10)}`);
  const short = long.replace(/^Manssuétude - /, "").replace(/\.pdf$/, "");
  assert.ok(short.length <= 100, `titre court trop long : ${short.length}`);
  assert.doesNotMatch(short, /\s$/);
  assert.equal(pdfDownloadFileName("   "), "Manssuétude - article.pdf");
});

test("URL de téléchargement — paramètre download encodé sur le Storage Supabase", () => {
  const url = new URL(pdfDownloadUrl(STORAGE, "Manssuétude - Perspective N°2.pdf"));
  assert.equal(url.searchParams.get("download"), "Manssuétude - Perspective N°2.pdf");
  assert.match(url.search, /download=Manssu%C3%A9tude/);
  // Lien externe (hors Storage) : inchangé.
  assert.equal(pdfDownloadUrl("https://exemple.org/doc.pdf", "x.pdf"), "https://exemple.org/doc.pdf");
});

test("route /telecharger — 404 : slug inconnu, brouillon, production sans PDF", () => {
  assert.deepEqual(resolveProductionDownload(null, STORAGE), { status: 404 });
  assert.deepEqual(resolveProductionDownload({ title: "Brouillon", status: "draft" }, STORAGE), { status: 404 });
  assert.deepEqual(resolveProductionDownload({ title: "Archivée", status: "archived" }, STORAGE), { status: 404 });
  assert.deepEqual(resolveProductionDownload({ title: "Sans PDF", status: "published" }, null), { status: 404 });
});

test("route /telecharger — 302 avec le paramètre download", () => {
  const result = resolveProductionDownload({ title: "Perspective N°1 : développement", status: "published" }, STORAGE);
  assert.equal(result.status, 302);
  if (result.status !== 302) return;
  assert.equal(result.fileName, "Manssuétude - Perspective N°1.pdf");
  const location = new URL(result.location);
  assert.equal(location.origin + location.pathname, STORAGE);
  assert.equal(location.searchParams.get("download"), result.fileName);
});
