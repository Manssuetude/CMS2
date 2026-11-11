import assert from "node:assert/strict";
import test from "node:test";
import {
  bannerWarning,
  headerImageFit,
  isBannerCompatible,
  pickHeaderImage,
  resolveEventHeader,
  resolveHeaderStyle,
  toHeaderStyle,
} from "../src/utils/eventHeader.ts";

const landscape = { id: "l", width: 5152, height: 3434 };
const portrait = { id: "p", width: 3864, height: 5152 };
const square = { id: "s", width: 1000, height: 1000 };

test("pickHeaderImage — affiche, sinon 1re photo de galerie, sinon rien", () => {
  assert.deepEqual(pickHeaderImage(portrait, [landscape]), { image: portrait, isPoster: true });
  assert.deepEqual(pickHeaderImage(null, [landscape, square]), { image: landscape, isPoster: false });
  assert.deepEqual(pickHeaderImage(undefined, []), { image: null, isPoster: false });
});

test("resolveHeaderStyle — Bannière conservée avec une image paysage", () => {
  assert.equal(resolveHeaderStyle("banner", landscape), "banner");
  assert.equal(resolveHeaderStyle("banner", { width: 1200, height: 1000 }), "banner");
});

test("resolveHeaderStyle — repli Classique : portrait, carré, absente ou dimensions inconnues", () => {
  assert.equal(resolveHeaderStyle("banner", portrait), "classic");
  assert.equal(resolveHeaderStyle("banner", square), "classic");
  assert.equal(resolveHeaderStyle("banner", { width: 1190, height: 1000 }), "classic");
  assert.equal(resolveHeaderStyle("banner", null), "classic");
  assert.equal(resolveHeaderStyle("banner", { width: null, height: null }), "classic");
});

test("resolveHeaderStyle — Classique reste Classique", () => {
  assert.equal(resolveHeaderStyle("classic", landscape), "classic");
});

test("isBannerCompatible — seuil 1,2", () => {
  assert.equal(isBannerCompatible({ width: 120, height: 100 }), true);
  assert.equal(isBannerCompatible({ width: 119, height: 100 }), false);
});

test("headerImageFit — affiche entière en Classique, recadrage sinon", () => {
  assert.equal(headerImageFit("classic", true), "contain");
  assert.equal(headerImageFit("classic", false), "cover");
  assert.equal(headerImageFit("banner", true), "cover");
});

test("toHeaderStyle — valeur inconnue → classic", () => {
  assert.equal(toHeaderStyle("banner"), "banner");
  assert.equal(toHeaderStyle("autre"), "classic");
  assert.equal(toHeaderStyle(null), "classic");
});

const poster = { id: "affiche", width: 940, height: 470 }; // affiche paysage avec du texte

test("resolveEventHeader — la bannière n'utilise jamais l'affiche, même paysage", () => {
  assert.deepEqual(resolveEventHeader("banner", poster, [landscape]), {
    style: "banner",
    image: landscape,
    isPoster: false,
  });
});

test("resolveEventHeader — Bannière sans photo de galerie → Classique avec l'affiche", () => {
  assert.deepEqual(resolveEventHeader("banner", poster, []), { style: "classic", image: poster, isPoster: true });
});

test("resolveEventHeader — Bannière avec 1re photo portrait → Classique", () => {
  assert.equal(resolveEventHeader("banner", null, [portrait, landscape]).style, "classic");
});

test("resolveEventHeader — Classique : affiche, sinon 1re photo", () => {
  assert.deepEqual(resolveEventHeader("classic", poster, [landscape]), {
    style: "classic",
    image: poster,
    isPoster: true,
  });
  assert.deepEqual(resolveEventHeader("classic", null, [landscape]), {
    style: "classic",
    image: landscape,
    isPoster: false,
  });
});

test("bannerWarning — aucune photo, photo portrait, ou rien à signaler", () => {
  assert.match(bannerWarning([]) ?? "", /Ajoutez au moins une photo/);
  assert.match(bannerWarning([portrait]) ?? "", /pas assez large/);
  assert.equal(bannerWarning([landscape]), null);
});
