import assert from "node:assert/strict";
import test from "node:test";
import { detectVideoProvider, getEmbedUrl } from "../src/utils/videoEmbed.ts";

test("detectVideoProvider — reconnaît YouTube et Vimeo, sinon null", () => {
  assert.equal(detectVideoProvider("https://www.youtube.com/watch?v=abc123"), "youtube");
  assert.equal(detectVideoProvider("https://youtu.be/abc123"), "youtube");
  assert.equal(detectVideoProvider("https://vimeo.com/123456789"), "vimeo");
  assert.equal(detectVideoProvider("https://example.com/video.mp4"), null);
});

test("getEmbedUrl — YouTube (watch, short, shorts) → URL nocookie embed", () => {
  assert.equal(
    getEmbedUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
    "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
  );
  assert.equal(getEmbedUrl("https://youtu.be/dQw4w9WgXcQ"), "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
  assert.equal(
    getEmbedUrl("https://www.youtube.com/shorts/dQw4w9WgXcQ"),
    "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
  );
});

test("getEmbedUrl — Vimeo → URL player embed", () => {
  assert.equal(getEmbedUrl("https://vimeo.com/123456789"), "https://player.vimeo.com/video/123456789");
});

test("getEmbedUrl — URL non reconnue → null", () => {
  assert.equal(getEmbedUrl("https://example.com/video.mp4"), null);
  assert.equal(getEmbedUrl("not a url"), null);
});
