import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();

const requiredFiles = [
  "ENGINEERING_GUIDE.md",
  "docs/ARCHITECTURE.md",
  "docs/AUDIT.md",
  "docs/CMS.md",
  "docs/DATABASE.md",
  "docs/WORKFLOWS.md",
  "src/constants/collections.ts",
  "src/constants/adminNavigation.ts",
  "src/config/designTokens.ts",
  "src/lib/errors.ts",
  "src/lib/logger.ts",
  "src/lib/validation.ts",
  "src/utils/row.ts",
  "src/utils/slug.ts",
];

test("Phase 0 foundation files exist", () => {
  for (const file of requiredFiles) {
    assert.equal(existsSync(join(root, file)), true, `${file} should exist`);
  }
});

test("lint script is non-interactive", () => {
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  assert.notEqual(pkg.scripts.lint, "next lint");
});

test("active source avoids explicit any", () => {
  const commandTargets = ["src", "scripts"];
  const files = commandTargets.flatMap((target) => collectFiles(join(root, target)));
  const offenders = files.filter((file) => /\bany\b|as any|Record<string, any>/.test(readFileSync(file, "utf8")));
  assert.deepEqual(
    offenders.map((file) => file.replace(`${root}/`, "")),
    [],
  );
});

function collectFiles(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) return collectFiles(fullPath);
    if (!/\.(ts|tsx|mjs)$/.test(fullPath)) return [];
    return [fullPath];
  });
}
