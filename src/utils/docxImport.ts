import mammoth from "mammoth";
import { MAX_DOCX_BYTES } from "@/constants/docxImport";
import { sanitizeHtml } from "@/utils/sanitizeHtml";

// Conversion d'un document Word (.docx) en HTML d'article (`productions.body`).
// Le téléversement des images est injecté (`uploadImage`) : ce module reste
// sans accès Supabase, donc testable avec un .docx de test.

export { MAX_DOCX_BYTES };

// Styles Word → HTML. « Titre 1 » ouvre une partie (<h2>), « Titre 2/3 » des
// sous-titres. Le titre du document (style « Titre » / « Title ») est ignoré :
// le titre de l'article est déjà saisi dans la fiche. Word enregistre les
// styles intégrés sous leur nom anglais (« heading 1 ») même en français ; les
// noms traduits couvrent les styles personnalisés et les autres traitements
// de texte (LibreOffice, Pages).
export const DOCX_STYLE_MAP = [
  "p[style-name='Title'] => !",
  "p[style-name='Titre'] => !",
  "p[style-name='heading 1'] => h2:fresh",
  "p[style-name='Heading 1'] => h2:fresh",
  "p[style-name='Titre 1'] => h2:fresh",
  "p[style-name='heading 2'] => h3:fresh",
  "p[style-name='Heading 2'] => h3:fresh",
  "p[style-name='Titre 2'] => h3:fresh",
  "p[style-name='heading 3'] => h4:fresh",
  "p[style-name='Heading 3'] => h4:fresh",
  "p[style-name='Titre 3'] => h4:fresh",
  "p[style-name='heading 4'] => h4:fresh",
  "p[style-name='Heading 4'] => h4:fresh",
  "p[style-name='Titre 4'] => h4:fresh",
];

/** Formats d'image acceptés par la médiathèque (les autres sont ignorés). */
export const DOCX_IMAGE_EXTENSIONS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

export type DocxImage = {
  bytes: Uint8Array<ArrayBuffer>;
  contentType: string;
  extension: string;
  altText: string | null;
};

/** Renvoie l'URL publique de l'image téléversée. */
export type DocxImageUploader = (image: DocxImage, index: number) => Promise<string>;

export type DocxConversion = { html: string; warnings: string[]; imageCount: number };

const NOTE_ITEM = /<li id="((?:footnote|endnote)-[^"]+)">([\s\S]*?)<\/li>/g;

type Note = { id: string; number: string; content: string };

function stripParagraphs(html: string): string {
  return html
    .replace(/<p>\s*<\/p>/g, "")
    .replace(/<\/p>\s*<p>/g, "<br />")
    .replace(/<\/?p>/g, "")
    .trim();
}

// Mammoth place toutes les notes à la fin du document. L'article étant lu par
// parties (une par <h2>), on range chaque note à la fin de la partie où elle
// est appelée : le lecteur la trouve sur la même page que l'appel de note.
export function distributeNotes(html: string): string {
  const lastList = html.lastIndexOf("<ol>");
  const tail = lastList >= 0 ? html.slice(lastList) : "";
  if (!/^<ol>\s*<li id="(?:footnote|endnote)-/.test(tail)) return html.replace(/<ol>\s*<\/ol>/g, "");
  const listEnd = tail.indexOf("</ol>") + "</ol>".length;
  // Ce qui suit la liste des notes (liste de commentaires vide <dl></dl>) est jeté.
  let body = html.slice(0, lastList);

  // Numéro affiché = ordre d'appel dans le texte ([1], [2]…), recopié tel quel.
  const numbers = new Map<string, string>();
  body = body.replace(
    /<sup><a href="#((?:footnote|endnote)-[^"]+)" id="([^"]+)">\[(\d+)\]<\/a><\/sup>/g,
    (_, noteId: string, refId: string, number: string) => {
      numbers.set(noteId, number);
      return `<sup class="footnote-ref"><a href="#${noteId}" id="${refId}">${number}</a></sup>`;
    },
  );

  const notes: Note[] = [];
  for (const match of tail.slice(0, listEnd).matchAll(NOTE_ITEM)) {
    const [, id, inner] = match;
    const content = stripParagraphs(inner.replace(/\s*<a href="#[^"]+">↑<\/a>/, ""));
    notes.push({ id, number: numbers.get(id) ?? String(notes.length + 1), content });
  }
  if (notes.length === 0) return body;

  const renderNotes = (list: Note[]) =>
    `<div class="footnotes"><p class="footnotes-title">Notes</p>${list
      .map(
        (n) =>
          `<p class="footnote" id="${n.id}"><a class="footnote-back" href="#${n.id.replace(/^(footnote|endnote)-/, "$1-ref-")}">${n.number}.</a> ${n.content}</p>`,
      )
      .join("")}</div>`;

  const sections = body.split(/(?=<h2[\s>])/);
  const placed = new Set<string>();
  const withNotes = sections.map((section) => {
    const own = notes.filter((n) => !placed.has(n.id) && section.includes(`href="#${n.id}"`));
    own.forEach((n) => placed.add(n.id));
    return own.length > 0 ? section + renderNotes(own) : section;
  });
  const orphans = notes.filter((n) => !placed.has(n.id));
  if (orphans.length > 0) withNotes[withNotes.length - 1] += renderNotes(orphans);
  return withNotes.join("");
}

// Signets Word (`<a id="…"></a>` vides, ex. `_Toc123`, `_GoBack`) : posés
// juste avant un titre, ils tomberaient dans la partie précédente au découpage.
// Un signet visé par un lien interne est reporté sur le titre qui le suit ;
// les autres sont retirés.
export function resolveBookmarks(html: string): string {
  const targeted = new Set([...html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]));
  const onHeadings = html.replace(
    /((?:<a id="[^"]*"><\/a>)+)(<(h[1-6]))(?![^>]*\bid=)/g,
    (match, anchors: string, open: string) => {
      const ids = [...anchors.matchAll(/<a id="([^"]*)"><\/a>/g)].map((m) => m[1]);
      const kept = ids.find((id) => targeted.has(id));
      return kept ? `${open} id="${kept}"` : open;
    },
  );
  return onHeadings.replace(/<a id="([^"]*)"><\/a>/g, (match, id: string) => (targeted.has(id) ? match : ""));
}

function dedupe(messages: string[]): string[] {
  return [...new Set(messages.map((m) => m.trim()).filter(Boolean))];
}

/** Convertit un .docx en HTML d'article nettoyé (images téléversées, notes réparties). */
export async function convertDocxToHtml(buffer: Buffer, uploadImage: DocxImageUploader): Promise<DocxConversion> {
  const warnings: string[] = [];
  let imageIndex = 0;
  let imageCount = 0;

  const result = await mammoth.convertToHtml(
    { buffer },
    {
      styleMap: DOCX_STYLE_MAP,
      convertImage: mammoth.images.imgElement(async (image) => {
        const index = imageIndex;
        imageIndex += 1;
        const contentType = image.contentType.toLowerCase();
        const extension = DOCX_IMAGE_EXTENSIONS[contentType];
        if (!extension) {
          warnings.push(`Image ${index + 1} ignorée : format non pris en charge (${contentType}).`);
          return { src: "" };
        }
        try {
          const bytes = new Uint8Array(await image.readAsArrayBuffer());
          const altText = (image as { altText?: string }).altText?.trim() || null;
          const src = await uploadImage({ bytes, contentType, extension, altText }, index);
          imageCount += 1;
          return { src };
        } catch {
          warnings.push(`Image ${index + 1} non importée : l'envoi vers la médiathèque a échoué.`);
          return { src: "" };
        }
      }),
    },
  );

  for (const message of result.messages) warnings.push(message.message);

  // Garde-fou : aucune image ne doit rester en base64 dans le corps, ni sans source.
  const withoutBrokenImages = result.value.replace(/<img\b[^>]*\bsrc="(?:data:[^"]*)?"[^>]*\/?>/gi, "");
  const html = sanitizeHtml(distributeNotes(resolveBookmarks(withoutBrokenImages)));

  return { html, warnings: dedupe(warnings), imageCount };
}
