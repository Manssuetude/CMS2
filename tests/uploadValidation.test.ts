import assert from "node:assert/strict";
import test from "node:test";
import { validateUpload, MAX_UPLOAD_BYTES } from "../src/utils/uploadValidation.ts";

function makeFile(name: string, type: string, size = 1024): File {
  return new File([new Uint8Array(size)], name, { type });
}

test("validateUpload — accepte un type autorisé avec MIME cohérent", () => {
  assert.doesNotThrow(() => validateUpload(makeFile("photo.jpg", "image/jpeg")));
  assert.doesNotThrow(() => validateUpload(makeFile("doc.pdf", "application/pdf")));
});

test("validateUpload — rejette une extension non autorisée", () => {
  assert.throws(() => validateUpload(makeFile("script.exe", "application/octet-stream")));
});

test("validateUpload — rejette un MIME incohérent avec l'extension", () => {
  assert.throws(() => validateUpload(makeFile("photo.jpg", "application/x-executable")));
});

test("validateUpload — accepte un fichier sans type déclaré (ne bloque pas sur ce seul critère)", () => {
  assert.doesNotThrow(() => validateUpload(makeFile("photo.jpg", "")));
});

test("validateUpload — rejette un fichier trop volumineux", () => {
  assert.throws(() => validateUpload(makeFile("photo.jpg", "image/jpeg", MAX_UPLOAD_BYTES + 1)));
});

test("validateUpload — accepte pile à la limite de taille", () => {
  assert.doesNotThrow(() => validateUpload(makeFile("photo.jpg", "image/jpeg", MAX_UPLOAD_BYTES)));
});
