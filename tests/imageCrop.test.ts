import assert from "node:assert/strict";
import test from "node:test";
import { parseImageCrop, cropToImageStyle } from "../src/utils/imageCrop.ts";

test("parseImageCrop — objet valide", () => {
  assert.deepEqual(parseImageCrop({ x: 10, y: 20, width: 40, height: 30, zoom: 2 }), {
    x: 10,
    y: 20,
    width: 40,
    height: 30,
    zoom: 2,
  });
});

test("parseImageCrop — chaîne JSON valide", () => {
  assert.deepEqual(parseImageCrop('{"x":0,"y":0,"width":50,"height":50,"zoom":1}'), {
    x: 0,
    y: 0,
    width: 50,
    height: 50,
    zoom: 1,
  });
});

test("parseImageCrop — zoom absent ou invalide → 1", () => {
  assert.equal(parseImageCrop({ x: 0, y: 0, width: 50, height: 50 })?.zoom, 1);
  assert.equal(parseImageCrop({ x: 0, y: 0, width: 50, height: 50, zoom: -3 })?.zoom, 1);
});

test("parseImageCrop — valeurs manquantes, nulles ou incohérentes → null", () => {
  assert.equal(parseImageCrop(null), null);
  assert.equal(parseImageCrop(undefined), null);
  assert.equal(parseImageCrop(""), null);
  assert.equal(parseImageCrop("pas du json"), null);
  assert.equal(parseImageCrop({ x: 0, y: 0, width: 50 }), null);
  assert.equal(parseImageCrop({ x: 0, y: 0, width: 0, height: 50, zoom: 1 }), null);
});

test("cropToImageStyle — sans crop → objet vide", () => {
  assert.deepEqual(cropToImageStyle(null), {});
  assert.deepEqual(cropToImageStyle(undefined), {});
});

test("cropToImageStyle — reproduit exactement le rectangle de recadrage (position absolue)", () => {
  // Le recadrage prend 40 % de la largeur et 40 % de la hauteur d'origine, à partir de (10, 20).
  const style = cropToImageStyle({ x: 10, y: 20, width: 40, height: 40, zoom: 1 });
  assert.equal(style.position, "absolute");
  // image agrandie : 100 / 0,40 = 250 % du conteneur
  assert.equal(style.width, "250.000%");
  assert.equal(style.height, "250.000%");
  // décalage : -x/width et -y/height
  assert.equal(style.left, "-25.000%");
  assert.equal(style.top, "-50.000%");
  assert.equal(style.maxWidth, "none");
});

test("cropToImageStyle — recadrage plein cadre = image inchangée", () => {
  const style = cropToImageStyle({ x: 0, y: 0, width: 100, height: 100, zoom: 1 });
  assert.equal(style.width, "100.000%");
  assert.equal(style.height, "100.000%");
  assert.equal(style.left, "0.000%");
  assert.equal(style.top, "0.000%");
});

test("cropToImageStyle — zoom n'a plus d'effet direct (déjà encodé dans width/height)", () => {
  // Deux crops de même rectangle mais zoom différent → même style (le zoom est intégré au rectangle).
  const a = cropToImageStyle({ x: 0, y: 0, width: 50, height: 50, zoom: 1 });
  const b = cropToImageStyle({ x: 0, y: 0, width: 50, height: 50, zoom: 3 });
  assert.deepEqual(a, b);
  assert.equal(a.width, "200.000%");
});
