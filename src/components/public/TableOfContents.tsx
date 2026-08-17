import type { TocHeading } from "@/utils/tableOfContents";

// En dessous de 3 titres, un sommaire n'apporte rien (l'article se lit
// d'une traite) — on l'affiche seulement pour un contenu vraiment long.
const MIN_HEADINGS = 3;

export function TableOfContents({ headings }: { headings: TocHeading[] }) {
  if (headings.length < MIN_HEADINGS) return null;

  return (
    <nav className="toc" aria-label="Sommaire">
      <p className="toc-label">Sommaire</p>
      <ol>
        {headings.map((h) => (
          <li key={h.id} className={h.level === 3 ? "toc-sub" : undefined}>
            <a href={`#${h.id}`}>{h.label}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
