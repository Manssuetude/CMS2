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

test("cropToImageStyle — point focal centré sur la zone recadrée", () => {
  const style = cropToImageStyle({ x: 10, y: 20, width: 40, height: 40, zoom: 1 });
  // centre = (10 + 40/2, 20 + 40/2) = (30, 40)
  assert.equal(style.objectPosition, "30.000% 40.000%");
  assert.equal(style.scale, undefined);
});

test("cropToImageStyle — zoom appliqué via la propriété scale", () => {
  const style = cropToImageStyle({ x: 0, y: 0, width: 50, height: 50, zoom: 2 });
  assert.equal(style.scale, "2");
  assert.equal(style.objectPosition, "25.000% 25.000%");
  assert.equal(style.transformOrigin, "25.000% 25.000%");
});

test("cropToImageStyle — point focal borné à [0, 100]", () => {
  const style = cropToImageStyle({ x: 90, y: 90, width: 40, height: 40, zoom: 1 });
  assert.equal(style.objectPosition, "100.000% 100.000%");
});
