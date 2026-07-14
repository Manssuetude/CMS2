import type { Page } from "@/types/cms";
import { sanitizeHtml } from "@/utils/sanitizeHtml";

// Les 5 étapes du cadre PERCA de Manssuétude.
const perca: Array<[string, string]> = [
  ["P", "Penser"],
  ["E", "Exprimer"],
  ["R", "Relier"],
  ["C", "Concrétiser"],
  ["A", "Ancrer"],
];

export function PercaEditorial({ page }: { page: Page }) {
  return (
    <div className="perca-page">
      <header className="perca-header">
        {page.eyebrow ? <p className="eyebrow">{page.eyebrow}</p> : null}
        <h1>{page.title}</h1>
      </header>

      <ol className="perca-steps">
        {perca.map(([letter, word]) => (
          <li key={letter}>
            <span className="perca-letter">{letter}</span>
            <span className="perca-word">{word}</span>
          </li>
        ))}
      </ol>

      {page.body ? (
        <div className="perca-body rich-text" dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.body) }} />
      ) : null}
    </div>
  );
}
