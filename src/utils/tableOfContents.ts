import { slugify } from "@/utils/slug";

// Détecte les liens de table des matières collés depuis un éditeur externe
// (Google Docs, Word) qui pointent encore vers le document source au lieu
// d'une section de la page publiée.
const EXTERNAL_TOC_HREF_PATTERN = /docs\.google\.com\/document|#_toc\d+|#heading=h\./i;

// Nettoie une entrée de table des matières collée (espaces insécables, numéro
// de page final ajouté par l'éditeur d'origine : "Introduction        5") et
// la numérotation de section ("I.", "1.", "a)"...) qui n'apparaît parfois que
// dans la table des matières et pas dans le titre réel.
function cleanTocLabel(text: string): string {
  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .replace(/\s*\d+\s*$/, "")
    .trim()
    .replace(/^(?:[ivxlcdm]+|\d+|[a-z])[.)]\s+/i, "")
    .trim();
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, "");
}

export type TocHeading = { id: string; label: string; level: 2 | 3 };

/**
 * Extrait les titres h2/h3 (avec leur `id`) d'un contenu déjà traité par
 * `fixTableOfContentsLinks`, pour construire un sommaire visible. Les h4
 * sont volontairement exclus : trop fins pour un sommaire de haut niveau.
 */
export function extractHeadings(html: string): TocHeading[] {
  const headings: TocHeading[] = [];
  const regex = /<(h[23])\s+[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/\1>/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html))) {
    const [, tag, id, inner] = match;
    const label = stripTags(inner).replace(/\s+/g, " ").trim();
    if (!label) continue;
    headings.push({ id, label, level: tag === "h2" ? 2 : 3 });
  }
  return headings;
}

/**
 * Ajoute un `id` à chaque titre (h2-h4) du contenu, puis réécrit les liens de
 * table des matières collés depuis un éditeur externe pour qu'ils pointent
 * vers l'ancre du titre correspondant sur la page (au lieu du document
 * source). Un lien externe sans titre correspondant est neutralisé (retiré)
 * plutôt que de renvoyer vers un document potentiellement privé.
 */
export function fixTableOfContentsLinks(html: string): string {
  const usedSlugs = new Map<string, number>();
  const slugByLabel = new Map<string, string>();

  // Un <h1> collé à l'intérieur du corps d'un article n'est jamais légitime
  // (la page a déjà son propre h1 : le titre de l'article) — c'est un artefact
  // de collage (Google Docs/Word) qu'on ramène au niveau h2 pour qu'il hérite
  // du même style que les autres titres de section et de la même génération
  // d'ancre ci-dessous.
  const withoutStrayH1 = html.replace(/<h1([^>]*)>([\s\S]*?)<\/h1>/gi, "<h2$1>$2</h2>");

  const withHeadingIds = withoutStrayH1.replace(
    /<(h[2-4])([^>]*)>([\s\S]*?)<\/\1>/gi,
    (match, tag: string, attrs: string, inner: string) => {
      if (/\bid=/.test(attrs)) return match;
      const label = cleanTocLabel(stripTags(inner));
      if (!label) return match;

      let slug = slugify(label) || "section";
      const count = usedSlugs.get(slug) ?? 0;
      usedSlugs.set(slug, count + 1);
      if (count > 0) slug = `${slug}-${count + 1}`;

      const key = label.toLowerCase();
      if (!slugByLabel.has(key)) slugByLabel.set(key, slug);

      return `<${tag}${attrs} id="${slug}">${inner}</${tag}>`;
    },
  );

  const withTocEntriesResolved = withHeadingIds.replace(
    /<a\s+([^>]*\bhref="([^"]*)"[^>]*)>([\s\S]*?)<\/a>/gi,
    (match, _attrs: string, href: string, inner: string) => {
      if (!EXTERNAL_TOC_HREF_PATTERN.test(href)) return match;

      const label = cleanTocLabel(stripTags(inner));
      const slug = slugByLabel.get(label.toLowerCase());
      // Une entrée de sommaire collée qui correspond à un vrai titre est retirée du
      // corps : le sommaire automatique (TableOfContents) affiche déjà cette même
      // navigation séparément, la garder ici la dupliquerait dans le texte.
      if (slug) return "";
      return inner; // aucun titre correspondant : on retire le lien plutôt que de fuiter le document source.
    },
  );

  // Nettoie les conteneurs devenus vides après le retrait des entrées de sommaire
  // (paragraphe ou item de liste qui ne contenait que le lien collé).
  return withTocEntriesResolved
    .replace(/<li[^>]*>\s*<\/li>/gi, "")
    .replace(/<p[^>]*>\s*<\/p>/gi, "")
    .replace(/<(ul|ol)[^>]*>\s*<\/\1>/gi, "");
}
