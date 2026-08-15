import { createRequire } from "node:module";

// `isomorphic-dompurify` (via jsdom → html-encoding-sniffer) peut faire un require()
// d'un module ESM pur qui casse selon l'environnement Node du déploiement
// (ERR_REQUIRE_ESM). Un `import` statique en tête de fichier planterait AU CHARGEMENT
// du module, hors de portée d'un try/catch. On charge donc le module à la demande,
// dans la fonction, pour pouvoir intercepter l'échec et se rabattre proprement.
const require = createRequire(import.meta.url);

let domPurify: typeof import("isomorphic-dompurify").default | null | undefined;

function loadDomPurify() {
  if (domPurify === undefined) {
    try {
      domPurify = require("isomorphic-dompurify");
    } catch {
      domPurify = null;
    }
  }
  return domPurify;
}

// Repli sûr si DOMPurify/jsdom ne peut pas s'exécuter : retire toutes les balises
// plutôt que de planter la page ou de renvoyer du HTML non nettoyé.
function stripAllTags(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/[<>]/g, "");
}

// Sanitise le HTML riche (issu de l'éditeur CKEditor) avant rendu via dangerouslySetInnerHTML.
// Défense en profondeur contre le XSS stocké : on retire scripts, handlers inline et URLs dangereuses.
export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return "";
  const DOMPurify = loadDomPurify();
  if (!DOMPurify) return stripAllTags(html);
  try {
    return DOMPurify.sanitize(html, {
      USE_PROFILES: { html: true },
      FORBID_TAGS: ["style", "script", "iframe", "object", "embed", "form"],
      FORBID_ATTR: ["style", "onerror", "onload", "onclick"],
    });
  } catch {
    return stripAllTags(html);
  }
}
