import type { ActivityFormat } from "@/types/cms";

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/**
 * Remplace les repères de format insérés dans le corps d'une activité (tapés via
 * "#" dans l'éditeur, voir RichTextEditor#mentionItems) par une bulle affichant
 * la description à jour du format. La description n'est jamais dupliquée en
 * base : elle est résolue ici, à l'affichage, à partir du répertoire actuel — la
 * modifier dans /admin/formatsactivites met donc à jour toutes les activités qui
 * la référencent, sans les rouvrir.
 */
export function injectFormatBubbles(html: string, formats: ActivityFormat[]): string {
  if (!html || formats.length === 0) return html;
  const byId = new Map(formats.map((f) => [f.id, f]));
  return html.replace(
    /<span class="format-chip-tip" data-format-id="([^"]+)">([\s\S]*?)<\/span>/gi,
    (match, id: string, inner: string) => {
      const format = byId.get(id);
      if (!format) return inner;
      if (!format.description) return inner;
      return `<span class="format-chip-tip" tabindex="0" role="button" aria-haspopup="true" aria-expanded="false">${inner}<span class="format-chip-tip__bubble" role="tooltip">${escapeHtml(format.description)}</span></span>`;
    },
  );
}
