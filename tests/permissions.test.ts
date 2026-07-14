import assert from "node:assert/strict";
import test from "node:test";
import { permKey, allPermissionKeys, permissionCatalog } from "../src/constants/permissions.ts";
import { can, canViewSection } from "../src/lib/permissions.ts";

const adminSession = { userId: "1", email: "a@x", roleKey: "admin", roleLabel: "Admin", isAdmin: true, permissions: ["*"] };
const prodSession = {
  userId: "2",
  email: "p@x",
  roleKey: "production",
  roleLabel: "Production",
  isAdmin: false,
  permissions: ["productions:view", "productions:edit"],
};

test("permKey — compose section:action", () => {
  assert.equal(permKey("themes", "edit"), "themes:edit");
});

test("allPermissionKeys — non vide et bien formées", () => {
  const keys = allPermissionKeys();
  assert.ok(keys.length > 0);
  assert.ok(keys.every((k) => /^[a-z]+:[a-z]+$/.test(k)));
  assert.ok(keys.includes("themes:view"));
});

test("catalogue — chaque section a au moins l'action view", () => {
  assert.ok(permissionCatalog.every((s) => s.actions.includes("view")));
});

test("can — admin a tous les droits", () => {
  assert.equal(can(adminSession, "themes:delete"), true);
  assert.equal(can(adminSession, "n-importe:quoi"), true);
});

test("can — rôle limité aux permissions accordées", () => {
  assert.equal(can(prodSession, "productions:view"), true);
  assert.equal(can(prodSession, "productions:edit"), true);
  assert.equal(can(prodSession, "productions:delete"), false);
  assert.equal(can(prodSession, "themes:view"), false);
});

test("can — session absente → refus", () => {
  assert.equal(can(null, "themes:view"), false);
  assert.equal(can(undefined, "themes:view"), false);
});

test("canViewSection", () => {
  assert.equal(canViewSection(prodSession, "productions"), true);
  assert.equal(canViewSection(prodSession, "themes"), false);
  assert.equal(canViewSection(adminSession, "themes"), true);
});
