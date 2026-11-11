import assert from "node:assert/strict";
import test from "node:test";
import {
  GALLERY_FALLBACK_RATIO,
  isMeaningfulAlt,
  photoCountLabel,
  photoRatio,
  preparePhotos,
  resolvePhotoAlt,
  splitVisible,
} from "../src/utils/gallery.ts";

test("photoRatio — ratio réel, repli 4:3 si dimensions absentes ou invalides", () => {
  assert.equal(photoRatio(4000, 3000), 4 / 3);
  assert.equal(photoRatio(3864, 5152), 3864 / 5152);
  assert.equal(photoRatio(null, 3000), GALLERY_FALLBACK_RATIO);
  assert.equal(photoRatio(4000, undefined), GALLERY_FALLBACK_RATIO);
  assert.equal(photoRatio(0, 0), GALLERY_FALLBACK_RATIO);
  assert.equal(photoRatio(-10, 20), GALLERY_FALLBACK_RATIO);
});

test("photoRatio — borne les formats extrêmes", () => {
  assert.equal(photoRatio(4000, 500), 2.5);
  assert.equal(photoRatio(500, 4000), 0.5);
});

test("isMeaningfulAlt — écarte les noms de fichier et les alt vides", () => {
  assert.equal(isMeaningfulAlt("IMG_6740.JPG"), false);
  assert.equal(isMeaningfulAlt("IMG_6761.JPG.jpeg"), false);
  assert.equal(isMeaningfulAlt("WhatsApp Image 2026-07-29 at 17.08.30.jpeg"), false);
  assert.equal(isMeaningfulAlt("IMG_6740"), false);
  assert.equal(isMeaningfulAlt("  "), false);
  assert.equal(isMeaningfulAlt(null), false);
  assert.equal(isMeaningfulAlt("Les intervenants en table ronde"), true);
  assert.equal(isMeaningfulAlt("zlecaf"), true);
});

test("resolvePhotoAlt — alt réel sinon « titre, photo N »", () => {
  assert.equal(resolvePhotoAlt("Le public pendant le débat", "Atelier", 0), "Le public pendant le débat");
  assert.equal(resolvePhotoAlt("IMG_6740.JPG", "Atelier", 2), "Atelier, photo 3");
  assert.equal(resolvePhotoAlt(null, "Atelier", 0), "Atelier, photo 1");
});

test("preparePhotos — conserve l'ordre et ajoute ratio + alt", () => {
  const photos = [
    { id: "a", url: "https://x/a.jpg", width: 3000, height: 2000, alt: "IMG_1.JPG", caption: null },
    { id: "b", url: "https://x/b.jpg", width: null, height: null, alt: "Une salle comble", caption: "Légende" },
  ];
  const prepared = preparePhotos(photos, "Atelier");
  assert.deepEqual(
    prepared.map((p) => [p.id, p.ratio, p.resolvedAlt, p.caption]),
    [
      ["a", 1.5, "Atelier, photo 1", null],
      ["b", GALLERY_FALLBACK_RATIO, "Une salle comble", "Légende"],
    ],
  );
});

test("splitVisible — 12 premières visibles, compte le reste", () => {
  const items = Array.from({ length: 15 }, (_, i) => i);
  assert.deepEqual(splitVisible(items), { visible: items.slice(0, 12), hiddenCount: 3 });
  assert.deepEqual(splitVisible([1, 2]), { visible: [1, 2], hiddenCount: 0 });
});

test("photoCountLabel — singulier / pluriel", () => {
  assert.equal(photoCountLabel(1), "1 photo");
  assert.equal(photoCountLabel(11), "11 photos");
});
