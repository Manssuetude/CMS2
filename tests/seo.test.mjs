import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import test from "node:test";

const publicDir = join(process.cwd(), "src/app/(public)");

function findPages(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return findPages(full);
    return entry === "page.tsx" ? [full] : [];
  });
}

const pages = findPages(publicDir);

test("pages publiques — au moins une page trouvée", () => {
  assert.ok(pages.length > 20, `seulement ${pages.length} page(s) trouvée(s)`);
});

test("pages publiques — chaque page.tsx exporte metadata ou generateMetadata", () => {
  const missing = pages.filter((file) => {
    const source = readFileSync(file, "utf8");
    return !/export\s+(const\s+metadata\b|async\s+function\s+generateMetadata\b|function\s+generateMetadata\b)/.test(
      source,
    );
  });
  assert.deepEqual(
    missing.map((file) => relative(publicDir, file)),
    [],
    "pages sans metadata/generateMetadata",
  );
});

test("pages publiques — aucun titre ne contient la marque en dur (le gabarit « | Manssuétude » l'ajoute)", () => {
  const offenders = pages.filter((file) => /title:\s*[`"'][^`"']*Manssuétude/.test(readFileSync(file, "utf8")));
  assert.deepEqual(
    offenders.map((file) => relative(publicDir, file)),
    [],
    "titre avec « Manssuétude » en dur (doublon avec le gabarit)",
  );
});
