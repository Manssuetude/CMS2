import { sanitizeHtml } from "@/utils/sanitizeHtml";
import { slugify } from "@/utils/slug";
import { extractHeadings, type TocHeading } from "@/utils/tableOfContents";

// Découpage d'un article (HTML riche, `productions.body`) en parties : chaque
// <h2> ouvre une partie, affichée sur sa propre page publique. Pur (aucun accès
// réseau/DB) — utilisé côté public (pages de parties) et côté admin (aperçu des
// parties détectées sous l'éditeur, résultat de l'import Word).

export type ArticlePart = {
  /** Position (0 = première partie, affichée sur /productions/[slug]). */
  index: number;
  /** Segment d'URL de la partie (dédoublonné : -2, -3...). */
  slug: string;
  title: string;
  /** HTML de la partie, sans son <h2> (le titre est affiché à part). */
  html: string;
  /** Sous-titres (h3) de la partie : sommaire interne si au moins 3. */
  headings: TocHeading[];
  /** Contenu placé avant le premier <h2>. */
  isIntro: boolean;
  /** Poids de lecture : nombre de caractères du texte (sans balises). */
  weight: number;
};

export const INTRO_PART_TITLE = "Introduction";

const VOID_TAGS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "source",
  "track",
  "wbr",
]);

const TAG_PATTERN = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][\w-]*)\b[^>]*?(\/?)>/g;

type TopLevelNode = { start: number; end: number; tag: string | null };

// Découpe le HTML en nœuds de premier niveau (éléments ou texte). Le HTML
// passé ici sort de sanitize-html, donc bien formé.
function topLevelNodes(html: string): TopLevelNode[] {
  const nodes: TopLevelNode[] = [];
  let depth = 0;
  let current: TopLevelNode | null = null;
  let cursor = 0;
  TAG_PATTERN.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = TAG_PATTERN.exec(html))) {
    const [full, closing, rawTag, selfClosing] = match;
    const tag = rawTag?.toLowerCase() ?? null;
    if (depth === 0 && match.index > cursor && html.slice(cursor, match.index).trim()) {
      nodes.push({ start: cursor, end: match.index, tag: null });
    }
    const end = match.index + full.length;
    if (!tag) {
      // Commentaire : ignoré à la racine, conservé à l'intérieur d'un élément.
      if (depth === 0) cursor = end;
      continue;
    }
    if (closing) {
      depth = Math.max(0, depth - 1);
      if (depth === 0 && current) {
        current.end = end;
        nodes.push(current);
        current = null;
        cursor = end;
      }
      continue;
    }
    const isVoid = VOID_TAGS.has(tag) || selfClosing === "/";
    if (depth === 0) {
      if (isVoid) {
        nodes.push({ start: match.index, end, tag });
        cursor = end;
        continue;
      }
      current = { start: match.index, end, tag };
    }
    if (!isVoid) depth += 1;
  }
  if (current) {
    current.end = html.length;
    nodes.push(current);
  } else if (cursor < html.length && html.slice(cursor).trim()) {
    nodes.push({ start: cursor, end: html.length, tag: null });
  }
  return nodes;
}

const IGNORABLE_ROOT_TAGS = new Set(["meta", "br", "link"]);

// HTML collé depuis Google Docs : tout le document est enveloppé dans
// `<b id="docs-internal-guid-…">` (ou un <div>/<section> selon la source). On
// retire ce conteneur unique pour retrouver les <h2> au premier niveau.
function unwrapSingleWrapper(html: string): string {
  let current = html;
  for (let guard = 0; guard < 5; guard += 1) {
    const nodes = topLevelNodes(current).filter((n) => !(n.tag && IGNORABLE_ROOT_TAGS.has(n.tag)));
    if (nodes.length !== 1) return current;
    const [node] = nodes;
    if (!node.tag || /^h[1-6]$/.test(node.tag) || VOID_TAGS.has(node.tag)) return current;
    const outer = current.slice(node.start, node.end);
    if (!/<h2[\s>]/i.test(outer)) return current;
    const openEnd = outer.indexOf(">") + 1;
    const closeStart = outer.lastIndexOf("</");
    if (openEnd <= 0 || closeStart < openEnd) return current;
    current = outer.slice(openEnd, closeStart);
  }
  return current;
}

function decodeEntities(text: string): string {
  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function textOf(html: string): string {
  return decodeEntities(html.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function hasContent(html: string): boolean {
  return textOf(html).length > 0 || /<(img|iframe|video|audio|table|figure)\b/i.test(html);
}

function idOf(elementHtml: string): string | null {
  return /^<[^>]*\bid="([^"]+)"/i.exec(elementHtml)?.[1] ?? null;
}

type RawPart = { title: string; html: string; anchorId: string | null; isIntro: boolean };

function buildIntro(nodesHtml: string[]): RawPart | null {
  const html = nodesHtml.join("");
  if (!hasContent(html)) return null;
  const firstHeading = /<(h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/i.exec(html);
  const title = firstHeading ? textOf(firstHeading[2]) : "";
  if (!title) return { title: INTRO_PART_TITLE, html, anchorId: null, isIntro: true };
  // Le titre devient celui de la partie : retiré du corps s'il l'ouvre (évite
  // de l'afficher deux fois), conservé s'il arrive plus loin dans le texte.
  const opensIntro = nodesHtml.find((n) => n.trim())?.trim() === firstHeading?.[0];
  return {
    title,
    html: opensIntro ? html.replace(firstHeading?.[0] ?? "", "") : html,
    anchorId: null,
    isIntro: true,
  };
}

// Une partie sans texte (seulement une image, un logo, des paragraphes vides)
// ne mérite pas sa propre page : son contenu est placé en tête de la partie
// suivante (ou, pour la dernière, à la fin de la précédente). Son titre
// disparaît avec elle. Modifie `raw` en place.
function mergeTextlessParts(raw: RawPart[]): void {
  for (let i = 0; i < raw.length && raw.length > 1; ) {
    const part = raw[i];
    if (textOf(part.html)) {
      i += 1;
      continue;
    }
    const next = raw[i + 1];
    if (next) {
      next.html = part.html + next.html;
    } else {
      raw[i - 1].html += part.html;
    }
    raw.splice(i, 1);
  }
}

/** Chemin public d'une partie : la première est servie sur l'URL de l'article. */
export function partPath(basePath: string, parts: Pick<ArticlePart, "slug">[], index: number): string {
  if (index <= 0 || !parts[index]) return basePath;
  return `${basePath}/${parts[index].slug}`;
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

// Un lien interne (#ancre) qui vise un titre/une note d'une autre partie doit
// pointer vers l'URL de cette partie, sinon il ne mène nulle part.
function rewriteCrossPartLinks(parts: ArticlePart[], anchorsByPart: Set<string>[], basePath: string): void {
  const ownerOf = new Map<string, number>();
  anchorsByPart.forEach((ids, index) => ids.forEach((id) => ownerOf.has(id) || ownerOf.set(id, index)));
  for (const part of parts) {
    part.html = part.html.replace(
      /(<a\b[^>]*\bhref=")#([^"]+)(")/gi,
      (match, before: string, id: string, after: string) => {
        const owner = ownerOf.get(safeDecode(id));
        if (owner == null || owner === part.index) return match;
        return `${before}${partPath(basePath, parts, owner)}#${id}${after}`;
      },
    );
  }
}

/**
 * Découpe un article en parties, une par <h2>. Le HTML est d'abord passé par
 * `sanitizeHtml` (qui ajoute aussi les `id` des titres via
 * `fixTableOfContentsLinks`). Renvoie [] pour un contenu vide, une seule
 * partie si l'article n'a aucun <h2>.
 *
 * `basePath` (ex. `/productions/mon-article`) active la réécriture des liens
 * internes vers une ancre située dans une autre partie.
 */
export function splitIntoParts(html: string | null | undefined, options: { basePath?: string } = {}): ArticlePart[] {
  const clean = unwrapSingleWrapper(sanitizeHtml(html));
  if (!hasContent(clean)) return [];

  const nodes = topLevelNodes(clean);
  const raw: RawPart[] = [];
  const introNodes: string[] = [];
  let currentPart: RawPart | null = null;

  for (const node of nodes) {
    const nodeHtml = clean.slice(node.start, node.end);
    // Un <h2> sans texte (logo mis en forme comme un titre, titre vide) n'ouvre
    // pas de partie : il reste dans le contenu, sinon la partie s'appellerait
    // « Partie 1 ».
    if (node.tag === "h2" && textOf(nodeHtml)) {
      if (currentPart) raw.push(currentPart);
      currentPart = { title: textOf(nodeHtml), html: "", anchorId: idOf(nodeHtml), isIntro: false };
      continue;
    }
    if (currentPart) currentPart.html += nodeHtml;
    else introNodes.push(nodeHtml);
  }
  if (currentPart) raw.push(currentPart);

  if (raw.length === 0) {
    // Aucun <h2> : une seule partie, affichée comme une page simple.
    raw.push({ title: INTRO_PART_TITLE, html: introNodes.join(""), anchorId: null, isIntro: true });
  } else {
    const intro = buildIntro(introNodes);
    if (intro) raw.unshift(intro);
  }
  mergeTextlessParts(raw);
  const usedSlugs = new Map<string, number>();
  const anchorsByPart: Set<string>[] = [];
  const parts = raw.map((part, index): ArticlePart => {
    const title = part.title || (part.isIntro ? INTRO_PART_TITLE : `Partie ${index + 1}`);
    let slug = slugify(title) || "partie";
    const count = usedSlugs.get(slug) ?? 0;
    usedSlugs.set(slug, count + 1);
    if (count > 0) slug = `${slug}-${count + 1}`;

    const html = part.html.trim();
    const anchors = new Set([...html.matchAll(/\bid="([^"]+)"/gi)].map((m) => m[1]));
    if (part.anchorId) anchors.add(part.anchorId);
    anchorsByPart.push(anchors);

    return {
      index,
      slug,
      title,
      html,
      headings: extractHeadings(html).filter((h) => h.level === 3),
      isIntro: part.isIntro,
      weight: textOf(html).length,
    };
  });

  if (options.basePath) rewriteCrossPartLinks(parts, anchorsByPart, options.basePath);
  return parts;
}

/**
 * Pourcentage lu de l'article : parties précédentes entières + fraction lue
 * de la partie courante, pondérées par la longueur de leur texte. Borné 0–100.
 */
export function readingPercent(weights: number[], currentIndex: number, fraction: number): number {
  const total = weights.reduce((sum, w) => sum + Math.max(0, w), 0);
  if (total <= 0 || weights.length === 0) return 0;
  const index = Math.min(Math.max(currentIndex, 0), weights.length - 1);
  const before = weights.slice(0, index).reduce((sum, w) => sum + Math.max(0, w), 0);
  const ratio = Math.min(Math.max(Number.isFinite(fraction) ? fraction : 0, 0), 1);
  const percent = Math.round(((before + ratio * Math.max(0, weights[index])) / total) * 100);
  return Math.min(100, Math.max(0, percent));
}

/**
 * Texte comparable : sans numérotation de section en tête (« V. », « 2) »,
 * « III - »), sans casse, accents, ligatures, espaces ni ponctuation.
 */
function comparableText(value: string): string {
  return value
    .trim()
    .replace(/^(?:[IVXLC]+|\d+)\s*[.)\-–—:]\s+/, "")
    .replace(/œ/gi, "oe")
    .replace(/æ/gi, "ae")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "");
}

/** Sous-titres d'une partie affichés dans le menu : sans celui qui répète le titre de la partie. */
export function partMenuHeadings(part: Pick<ArticlePart, "title" | "headings">): Array<{ id: string; label: string }> {
  const title = comparableText(part.title);
  return part.headings
    .filter((h) => h.level === 3 && comparableText(h.label) !== title)
    .map((h) => ({ id: h.id, label: h.label }));
}

export type PartsMenuItem = {
  title: string;
  href: string;
  /** Sous-titres (h3), seulement pour la partie ouverte. */
  headings: Array<{ id: string; label: string }>;
};

/** Menu « Dans cet article » : seule la partie ouverte déplie ses sous-titres. */
export function buildPartsMenu(parts: ArticlePart[], currentIndex: number, basePath: string): PartsMenuItem[] {
  return parts.map((part, index) => ({
    title: part.title,
    href: partPath(basePath, parts, index),
    headings: index === currentIndex ? partMenuHeadings(part) : [],
  }));
}

/** Début du texte d'une partie, pour sa meta description. */
export function partExcerpt(part: Pick<ArticlePart, "html">, max = 200): string {
  const text = textOf(part.html.replace(/<div class="footnotes">[\s\S]*?<\/div>/g, ""));
  if (text.length <= max) return text;
  return `${text.slice(0, max).replace(/\s+\S*$/, "")}…`;
}
