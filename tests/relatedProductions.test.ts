import assert from "node:assert/strict";
import test from "node:test";
import { rankRelatedProductions } from "../src/utils/relatedProductions.ts";
import type { Production } from "../src/types/cms.ts";

function makeProduction(overrides: Partial<Production> & { id: string }): Production {
  return {
    slug: overrides.id,
    title: overrides.id,
    type: "Article",
    description: null,
    body: null,
    contentBlocks: [],
    author: null,
    date: null,
    thumbnailId: null,
    fileId: null,
    downloadLabel: null,
    readingTime: null,
    pages: null,
    tags: [],
    status: "published",
    featured: false,
    subThemeIds: [],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

test("rankRelatedProductions — priorise le sous-thème partagé sur le tag partagé", () => {
  const current = makeProduction({ id: "current", tags: ["afrique"] });
  const bySubTheme = makeProduction({ id: "by-subtheme", tags: [] });
  const byTag = makeProduction({ id: "by-tag", tags: ["afrique"] });

  const result = rankRelatedProductions(current, ["st-1"], [bySubTheme, byTag], { "by-subtheme": ["st-1"] }, 3);

  assert.deepEqual(
    result.map((p) => p.id),
    ["by-subtheme", "by-tag"],
  );
});

test("rankRelatedProductions — exclut la production courante et les non pertinentes", () => {
  const current = makeProduction({ id: "current", tags: ["afrique"] });
  const unrelated = makeProduction({ id: "unrelated", tags: ["europe"] });

  const result = rankRelatedProductions(current, [], [current, unrelated], {}, 3);
  assert.deepEqual(result, []);
});

test("rankRelatedProductions — respecte la limite", () => {
  const current = makeProduction({ id: "current", tags: ["afrique"] });
  const candidates = [1, 2, 3, 4].map((n) => makeProduction({ id: `p${n}`, tags: ["afrique"] }));

  const result = rankRelatedProductions(current, [], candidates, {}, 2);
  assert.equal(result.length, 2);
});

test("rankRelatedProductions — départage par date la plus récente à score égal", () => {
  const current = makeProduction({ id: "current", tags: ["afrique"] });
  const older = makeProduction({ id: "older", tags: ["afrique"], date: "2025-01-01" });
  const newer = makeProduction({ id: "newer", tags: ["afrique"], date: "2026-01-01" });

  const result = rankRelatedProductions(current, [], [older, newer], {}, 2);
  assert.deepEqual(
    result.map((p) => p.id),
    ["newer", "older"],
  );
});
