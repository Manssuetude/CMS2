import sanitizeHtmlLib from "sanitize-html";
import { fixTableOfContentsLinks } from "@/utils/tableOfContents";

const FORBIDDEN_TAGS = ["style", "script", "iframe", "object", "embed", "form"];
const FORBIDDEN_ATTRS = new Set(["style", "onerror", "onload", "onclick"]);

// Sanitise le HTML riche (issu de l'éditeur CKEditor) avant rendu via dangerouslySetInnerHTML.
// Défense en profondeur contre le XSS stocké : on retire scripts, handlers inline et URLs
// dangereuses. Permissif par défaut (liste noire, pas liste blanche) pour ne pas perdre de
// mise en forme légitime — seuls les éléments/attributs ci-dessus sont retirés.
//
// sanitize-html est une dépendance pure JS (pas de jsdom) : contrairement à
// isomorphic-dompurify (précédemment utilisé ici), elle ne dépend pas d'un require() d'un
// module ESM qui casse selon l'environnement Node du déploiement (ERR_REQUIRE_ESM déjà
// rencontré deux fois en prod : crash complet de /history, puis perte silencieuse de la mise
// en forme sur les instances Vercel touchées par le bug — le chargement était mis en cache
// par instance, donc certaines requêtes tombaient sur le repli texte brut et d'autres non).
export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return "";
  const clean = sanitizeHtmlLib(html, {
    allowedTags: false,
    allowedAttributes: false,
    // allowedTags:false autorise script/style au niveau liste, mais exclusiveFilter
    // ci-dessous les retire systématiquement (couvert par les tests) — on assume ce
    // risque explicitement pour faire taire l'avertissement de la librairie.
    allowVulnerableTags: true,
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["http", "https", "data"] },
    exclusiveFilter: (frame) => FORBIDDEN_TAGS.includes(frame.tag),
    transformTags: {
      "*": (tagName, attribs) => {
        const kept: sanitizeHtmlLib.Attributes = {};
        for (const [name, value] of Object.entries(attribs)) {
          if (!FORBIDDEN_ATTRS.has(name)) kept[name] = value;
        }
        return { tagName, attribs: kept };
      },
    },
  });
  return fixTableOfContentsLinks(clean);
}
