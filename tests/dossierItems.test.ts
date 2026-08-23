import assert from "node:assert/strict";
import test from "node:test";
import { resolveDossierItems } from "../src/utils/dossierItems.ts";
import type { Event, DossierItem, JournalEntry, Media, Production, Project } from "../src/types/cms.ts";

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

function makeEvent(overrides: Partial<Event> & { id: string }): Event {
  return {
    slug: overrides.id,
    title: overrides.id,
    format: "Atelier",
    status: "published",
    gallery: [],
    documents: [],
    speakers: [],
    featured: false,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

function makeProject(overrides: Partial<Project> & { id: string }): Project {
  return {
    slug: overrides.id,
    title: overrides.id,
    status: "published",
    objectives: [],
    deliverables: [],
    documents: [],
    featured: false,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

function makeMedia(overrides: Partial<Media> & { id: string }): Media {
  return {
    title: overrides.id,
    filename: `${overrides.id}.pdf`,
    source: "upload",
    type: "document",
    mimeType: "application/pdf",
    url: `/files/${overrides.id}.pdf`,
    tags: [],
    visibility: "published",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

function makeJournalEntry(overrides: Partial<JournalEntry> & { id: string }): JournalEntry {
  return {
    slug: overrides.id,
    title: overrides.id,
    status: "published",
    featured: false,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

function item(
  overrides: Partial<DossierItem> & { entityType: DossierItem["entityType"]; entityId: string },
): DossierItem {
  return { id: `${overrides.entityType}-${overrides.entityId}`, dossierId: "dossier-1", position: 0, ...overrides };
}

const source = {
  productions: [makeProduction({ id: "p1", slug: "prod-un" })],
  events: [makeEvent({ id: "a1", slug: "act-un" })],
  projects: [makeProject({ id: "pr1", slug: "proj-un" })],
  resources: [makeMedia({ id: "r1" })],
  journalEntries: [makeJournalEntry({ id: "j1", slug: "journal-un" })],
};

test("resolveDossierItems — résout chaque type vers son URL publique, dans l'ordre des positions", () => {
  const items = [
    item({ entityType: "event", entityId: "a1", position: 1 }),
    item({ entityType: "production", entityId: "p1", position: 0 }),
  ];
  const result = resolveDossierItems(items, source);
  assert.deepEqual(
    result.map((r) => r.href),
    ["/productions/prod-un", "/evenements/act-un"],
  );
});

test("resolveDossierItems — ignore silencieusement une entrée dont la cible a été supprimée", () => {
  const items = [item({ entityType: "production", entityId: "does-not-exist", position: 0 })];
  const result = resolveDossierItems(items, source);
  assert.deepEqual(result, []);
});

test("resolveDossierItems — résout un projet, une ressource et une entrée de Journal", () => {
  const items = [
    item({ entityType: "project", entityId: "pr1", position: 0 }),
    item({ entityType: "resource", entityId: "r1", position: 1 }),
    item({ entityType: "journal_entry", entityId: "j1", position: 2 }),
  ];
  const result = resolveDossierItems(items, source);
  assert.deepEqual(
    result.map((r) => r.href),
    ["/projets/proj-un", "/ressources/r1", "/journal/journal-un"],
  );
});
