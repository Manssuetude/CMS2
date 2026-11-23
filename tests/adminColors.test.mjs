import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

// Garde-fou du thème clair / sombre de l'admin : aucune couleur écrite en
// dur dans les feuilles de l'admin. Toutes les couleurs passent par les
// variables de src/styles/parts/tokens.css (valeur claire + valeur sombre).

const PARTS = "src/styles/parts";
const COLOR = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?)\(/;

const files = readdirSync(PARTS).filter((name) => /^admin-.*\.css$/.test(name) || name === "activation.css");

test("feuilles de l'admin trouvées", () => {
  assert.ok(files.includes("admin-components.css"));
  assert.ok(files.includes("activation.css"));
  assert.ok(!files.includes("tokens.css"));
});

for (const name of files) {
  test(`${name} : aucune couleur en dur (utiliser les variables de tokens.css)`, () => {
    const offenders = readFileSync(join(PARTS, name), "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, " "))
      .split("\n")
      .map((line, index) => ({ line: line.trim(), number: index + 1 }))
      .filter(({ line }) => COLOR.test(line));
    assert.deepEqual(
      offenders.map(({ number, line }) => `${name}:${number} ${line}`),
      [],
    );
  });
}

test("tokens.css : chaque variable de l'admin a une valeur sombre aux deux endroits", () => {
  const tokens = readFileSync(join(PARTS, "tokens.css"), "utf8");
  const darkExplicit = tokens.slice(tokens.indexOf(':root[data-theme="dark"]'), tokens.indexOf("@media"));
  const darkSystem = tokens.slice(tokens.indexOf("@media (prefers-color-scheme: dark)"));
  for (const name of ["--admin-bg", "--admin-input-bg", "--status-published-bg", "--status-danger-ink"]) {
    assert.match(darkExplicit, new RegExp(`${name}:`), `${name} manque dans :root[data-theme="dark"]`);
    assert.match(darkSystem, new RegExp(`${name}:`), `${name} manque dans le bloc prefers-color-scheme`);
  }
});
