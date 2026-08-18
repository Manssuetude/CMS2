"use client";

import { useState } from "react";
import type { Page } from "@/types/cms";
import { sanitizeHtml } from "@/utils/sanitizeHtml";

// Les 5 étapes du cadre PERCA de Manssuétude — lettres/mots fixes, contenu
// détaillé (titre + corps) éditable par étape depuis /admin/perca.
const PERCA: Array<[string, string]> = [
  ["P", "Penser"],
  ["E", "Exprimer"],
  ["R", "Relier"],
  ["C", "Concrétiser"],
  ["A", "Ancrer"],
];

export function PercaEditorial({ page }: { page: Page }) {
  const [active, setActive] = useState<string | null>(null);
  const stepByLetter = new Map((page.percaSteps ?? []).map((s) => [s.letter, s]));

  return (
    <div className="perca-page">
      <header className="perca-header">
        {page.eyebrow ? <p className="eyebrow">{page.eyebrow}</p> : null}
        <h1>{page.title}</h1>
      </header>

      <ol className="perca-steps">
        {PERCA.map(([letter, word]) => {
          const step = stepByLetter.get(letter);
          const hasDetail = Boolean(step?.title || step?.body);
          const isActive = active === letter;
          return (
            <li key={letter} className={isActive ? "is-active" : undefined}>
              <button
                type="button"
                className="perca-step-trigger"
                disabled={!hasDetail}
                aria-expanded={isActive}
                onClick={() => setActive(isActive ? null : letter)}
              >
                <span className="perca-letter">{letter}</span>
                <span className="perca-word">{word}</span>
              </button>
              {hasDetail && isActive && (
                <div className="perca-step-detail">
                  {step?.title && <p className="perca-step-title">{step.title}</p>}
                  {step?.body && (
                    <div className="rich-text" dangerouslySetInnerHTML={{ __html: sanitizeHtml(step.body) }} />
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {page.body ? (
        <div className="perca-body rich-text" dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.body) }} />
      ) : null}
    </div>
  );
}
