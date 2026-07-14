import DOMPurify from "isomorphic-dompurify";

// Sanitise le HTML riche (issu de l'éditeur CKEditor) avant rendu via dangerouslySetInnerHTML.
// Défense en profondeur contre le XSS stocké : on retire scripts, handlers inline et URLs dangereuses.
export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return "";
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ["style", "script", "iframe", "object", "embed", "form"],
    FORBID_ATTR: ["style", "onerror", "onload", "onclick"],
  });
}
