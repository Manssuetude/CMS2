import assert from "node:assert/strict";
import test from "node:test";
import { formatPageCount, pickNextArticle, splitArticleTitle } from "../src/utils/articleNavigation.ts";

type P = { id: string; slug: string; title: string; date: string; status: "published" | "draft" | "archived" };

function prod(id: string, date: string, status: P["status"] = "published"): P {
  return { id, slug: id, title: id, date, status };
}

const all = [
  prod("a", "2026-09-01"),
  prod("b", "2026-08-01"),
  prod("c", "2026-07-01"),
  prod("d", "2026-06-01"),
  prod("e", "2026-05-01", "draft"),
];

test("pickNextArticle — production suivante du même sous-thème (ordre du sous-thème : récente → ancienne)", () => {
  const links = { a: ["st1"], c: ["st1"], b: ["st2"] };
  assert.equal(pickNextArticle(all[0], ["st1"], all, links)?.id, "c");
});

test("pickNextArticle — dernière du sous-thème : la plus récente publiée avant elle", () => {
  const links = { a: ["st1"], c: ["st1"] };
  assert.equal(pickNextArticle(all[2], ["st1"], all, links)?.id, "d");
});

test("pickNextArticle — sans sous-thème : la plus récente publiée avant elle", () => {
  assert.equal(pickNextArticle(all[0], [], all, {})?.id, "b");
});

test("pickNextArticle — ignore les brouillons, null s'il n'y a rien avant", () => {
  const links = { d: ["st1"], e: ["st1"] };
  assert.equal(pickNextArticle(all[3], ["st1"], all, links), null);
});

test("splitArticleTitle — « Question ? Sous-titre »", () => {
  assert.deepEqual(splitArticleTitle("Produire ensemble ? Le chaînon manquant de l'intégration africaine"), {
    main: "Produire ensemble ?",
    subtitle: "Le chaînon manquant de l'intégration africaine",
  });
});

test("splitArticleTitle — « Sujet : sous-titre » et titre sans séparateur", () => {
  assert.deepEqual(splitArticleTitle("Industrialisation en CEMAC : où en sommes-nous ?"), {
    main: "Industrialisation en CEMAC",
    subtitle: "où en sommes-nous ?",
  });
  assert.deepEqual(splitArticleTitle("Où en sommes-nous ?"), { main: "Où en sommes-nous ?", subtitle: null });
  assert.deepEqual(splitArticleTitle("Un titre simple"), { main: "Un titre simple", subtitle: null });
});

test("formatPageCount — nombre seul ou libellé libre", () => {
  assert.equal(formatPageCount("10"), "10 pages");
  assert.equal(formatPageCount("1"), "1 page");
  assert.equal(formatPageCount("12 p."), "12 p.");
  assert.equal(formatPageCount(" "), null);
  assert.equal(formatPageCount(null), null);
});
