import type { Page } from "@/types/cms";

// Les 5 étapes du cadre PERCA de Manssuétude.
const perca: Array<[string, string]> = [
  ["P", "Penser"],
  ["E", "Exprimer"],
  ["R", "Relier"],
  ["C", "Concrétiser"],
  ["A", "Ancrer"],
];

export function PercaEditorial({ page }: { page: Page }) {
  const paragraphs = (page.body || "").split(/\n{2,}|\n/).filter((p) => p.trim().length > 0);

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

      {paragraphs.length ? (
        <div className="perca-body">
          {paragraphs.map((text, i) => (
            <p key={i}>{text}</p>
          ))}
        </div>
      ) : null}
    </div>
  );
}
