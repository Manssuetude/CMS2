import assert from "node:assert/strict";
import test from "node:test";
import { buildTodoList, todoCount, type TodoSources } from "../src/utils/todo.ts";

const now = new Date("2026-11-24T10:00:00Z");
const today = "2026-11-24";
const recent = "2026-11-20T10:00:00Z";
const old = "2026-09-01T10:00:00Z";

const empty: TodoSources = { productions: [], events: [], projects: [], forms: [] };

test("À faire — rien à faire : liste vide", () => {
  assert.deepEqual(buildTodoList(empty, now, today), []);
  assert.equal(todoCount([]), 0);
});

test("À faire — productions publiées sans Word ou sans PDF (brouillons ignorés)", () => {
  const list = buildTodoList(
    {
      ...empty,
      productions: [
        { id: "a", title: "A", status: "published", updatedAt: recent, hasBody: false, hasPdf: true },
        { id: "b", title: "B", status: "published", updatedAt: recent, hasBody: true, hasPdf: false },
        { id: "c", title: "C", status: "draft", updatedAt: recent, hasBody: false, hasPdf: false },
      ],
    },
    now,
    today,
  );
  assert.deepEqual(
    list.map((c) => [c.id, c.items.map((i) => i.id)]),
    [
      ["word", ["a"]],
      ["pdf", ["b"]],
    ],
  );
  assert.equal(list[0].items[0].href, "/admin/productions/a/edit#fichiers");
});

test("À faire — brouillons non modifiés depuis plus de 30 jours (événements, productions, projets)", () => {
  const list = buildTodoList(
    {
      ...empty,
      productions: [{ id: "p", title: "P", status: "draft", updatedAt: old, hasBody: true, hasPdf: true }],
      projects: [
        { id: "j", title: "J", status: "draft", updatedAt: old },
        { id: "k", title: "K", status: "draft", updatedAt: recent },
      ],
      events: [{ id: "e", title: "E", status: "draft", updatedAt: old, date: null, gallery: [], documents: [] }],
    },
    now,
    today,
  );
  assert.equal(list.length, 1);
  assert.equal(list[0].id, "drafts");
  assert.deepEqual(
    list[0].items.map((i) => i.title),
    ["Événement · E", "Production · P", "Projet · J"],
  );
});

test("À faire — formulaires non traités et événements passés sans photos", () => {
  const list = buildTodoList(
    {
      ...empty,
      forms: [
        { id: "f1", status: "reçu", label: "Adhésion · Awa" },
        { id: "f2", status: "en cours", label: "Projet · Ali" },
        { id: "f3", status: "traité", label: "Don" },
      ],
      events: [
        {
          id: "e1",
          title: "Passé",
          status: "published",
          updatedAt: recent,
          date: "2026-09-23",
          gallery: [],
          documents: [],
        },
        {
          id: "e2",
          title: "Avec photos",
          status: "published",
          updatedAt: recent,
          date: "2026-09-23",
          gallery: ["x"],
          documents: [],
        },
        {
          id: "e3",
          title: "À venir",
          status: "published",
          updatedAt: recent,
          date: "2026-12-01",
          gallery: [],
          documents: [],
        },
      ],
    },
    now,
    today,
  );
  assert.deepEqual(
    list.map((c) => [c.id, c.items.map((i) => i.id)]),
    [
      ["forms", ["f1", "f2"]],
      ["event-photos", ["e1"]],
    ],
  );
  assert.equal(todoCount(list), 3);
  assert.equal(list[1].items[0].href, "/admin/evenements/e1/edit#photos");
});
