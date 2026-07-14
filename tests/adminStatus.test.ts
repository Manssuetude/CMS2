import assert from "node:assert/strict";
import test from "node:test";
import { resolveActiveStatus, countByStatus, buildStatusTabs, STATUS_LABELS } from "../src/utils/adminStatus.ts";

test("resolveActiveStatus — statut valide ou null", () => {
  assert.equal(resolveActiveStatus("draft"), "draft");
  assert.equal(resolveActiveStatus("published"), "published");
  assert.equal(resolveActiveStatus("inconnu"), null);
  assert.equal(resolveActiveStatus(undefined), null);
});

test("countByStatus — compte par statut + total", () => {
  const items = [
    { status: "published" },
    { status: "published" },
    { status: "draft" },
    { status: "archived" },
  ] as const;
  const c = countByStatus(items as unknown as { status: never }[]);
  assert.deepEqual(c, { all: 4, published: 2, draft: 1, archived: 1 });
});

test("buildStatusTabs — accord féminin/masculin", () => {
  const counts = { all: 3, published: 1, draft: 1, archived: 1 };
  const f = buildStatusTabs(counts, "f");
  const m = buildStatusTabs(counts, "m");
  assert.equal(f[0].label, "Toutes");
  assert.equal(m[0].label, "Tous");
  assert.equal(f[1].label, "Publiées");
  assert.equal(m[1].label, "Publiés");
  assert.equal(f[0].count, 3);
});

test("STATUS_LABELS — libellés présents", () => {
  assert.equal(STATUS_LABELS.draft, "Brouillon");
  assert.equal(STATUS_LABELS.published, "Publié");
  assert.equal(STATUS_LABELS.archived, "Archivé");
});
