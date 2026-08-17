import Link from "next/link";
import { Hero } from "@/components/public/Hero";
import type { Page } from "@/types/cms";
import { sanitizeHtml } from "@/utils/sanitizeHtml";

// PERCA = le cadre méthodologique de Manssuétude (source : page perca en base).
const perca: Array<[string, string]> = [
  ["P", "Penser"],
  ["E", "Exprimer"],
  ["R", "Relier"],
  ["C", "Concrétiser"],
  ["A", "Ancrer"],
];

export function AboutEditorial({ page, percaPage }: { page: Page; percaPage?: Page | null }) {
  return (
    <div className="about">
      <Hero
        eyebrow={page.eyebrow}
        title={page.title}
        body={page.body}
        imageUrl={page.imageUrl ?? undefined}
        primaryLabel={page.primaryCtaLabel}
        primaryTarget={page.primaryCtaTarget}
        secondaryLabel={page.secondaryCtaLabel}
        secondaryTarget={page.secondaryCtaTarget}
      />

      {page.quote ? (
        <section className="about-quote">
          <blockquote>{page.quote}</blockquote>
        </section>
      ) : null}

      {/* Notre méthode PERCA (section fusionnée depuis l'ancienne page /perca) */}
      <section className="about-perca">
        <div className="section-head">
          <p className="eyebrow">Notre méthode</p>
          <h2>PERCA</h2>
        </div>
        {percaPage?.body ? (
          <div
            className="about-perca-intro rich-text"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(percaPage.body) }}
          />
        ) : null}
        <ol className="perca-steps">
          {perca.map(([letter, word]) => (
            <li key={letter}>
              <span className="perca-letter">{letter}</span>
              <span className="perca-word">{word}</span>
            </li>
          ))}
        </ol>
        <Link className="about-perca-link" href="/perca">
          PERCA plus en détail <span aria-hidden>→</span>
        </Link>
      </section>
    </div>
  );
}
