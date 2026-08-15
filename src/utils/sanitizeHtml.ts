import DOMPurify from "isomorphic-dompurify";

// Repli sûr si DOMPurify/jsdom ne peut pas s'exécuter (ex. incompatibilité Node/ESM
// selon l'environnement de déploiement) : retire toutes les balises plutôt que de
// planter la page ou de renvoyer du HTML non nettoyé.
function stripAllTags(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/[<>]/g, "");
}

// Sanitise le HTML riche (issu de l'éditeur CKEditor) avant rendu via dangerouslySetInnerHTML.
// Défense en profondeur contre le XSS stocké : on retire scripts, handlers inline et URLs dangereuses.
export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return "";
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
