import assert from "node:assert/strict";
import test from "node:test";
import { ADMIN_NAV_GROUPS } from "../src/constants/adminNav.ts";
import { activeNavHref, hiddenEmptySections, visibleNavGroups } from "../src/utils/adminNav.ts";

const admin = { isAdmin: true, permissions: [] };
const editor = { isAdmin: false, permissions: ["productions:view", "journal:view", "forms:view"] };
const empty = { journal: true, dossiers: true };
const ids = (groups: ReturnType<typeof visibleNavGroups>) => groups.flatMap((g) => g.items.map((i) => i.id));

test("menu — sections vides masquées, réaffichables", () => {
  assert.ok(!ids(visibleNavGroups(ADMIN_NAV_GROUPS, admin, empty, false)).includes("journal"));
  assert.ok(ids(visibleNavGroups(ADMIN_NAV_GROUPS, admin, empty, true)).includes("dossiers"));
  assert.deepEqual(hiddenEmptySections(ADMIN_NAV_GROUPS, admin, empty), ["Journal", "Dossiers"]);
  assert.deepEqual(hiddenEmptySections(ADMIN_NAV_GROUPS, admin, { journal: false, dossiers: false }), []);
});

test("menu — un rôle ne voit que ses sections, jamais les réglages admin", () => {
  const visible = ids(visibleNavGroups(ADMIN_NAV_GROUPS, editor, { journal: false, dossiers: false }, false));
  assert.deepEqual(visible, ["productions", "journal", "forms"]);
  assert.deepEqual(hiddenEmptySections(ADMIN_NAV_GROUPS, editor, empty), ["Journal"]);
});

test("menu — entrée active : préfixe le plus long", () => {
  const hrefs = ADMIN_NAV_GROUPS.flatMap((g) => g.items.map((i) => i.href));
  assert.equal(activeNavHref("/admin/pages/nous-rejoindre", hrefs), "/admin/pages/nous-rejoindre");
  assert.equal(activeNavHref("/admin/pages", hrefs), "/admin/pages");
  assert.equal(activeNavHref("/admin/productions/12/edit", hrefs), "/admin/productions");
  assert.equal(activeNavHref("/admin/formsx", hrefs), null);
});
