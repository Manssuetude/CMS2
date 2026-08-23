"use client";

import { useEffect, useState } from "react";
import type { PercaStep } from "@/types/cms";
import { sanitizeHtml } from "@/utils/sanitizeHtml";

// Les 5 étapes du cadre PERCA — lettres/mots fixes, contenu détaillé (titre +
// corps) éditable par étape depuis /admin/perca. Composant partagé : la même
// interaction (bulle au clic) s'utilise sur /perca et sur la section PERCA
// de /a-propos, pour ne pas dupliquer la logique ni le contenu.
const FIXED_STEPS: Array<[string, string]> = [
  ["P", "Penser"],
  ["E", "Exprimer"],
  ["R", "Relier"],
  ["C", "Concrétiser"],
  ["A", "Ancrer"],
];

export function PercaStepsInteractive({ steps = [] }: { steps?: PercaStep[] }) {
  const [active, setActive] = useState<string | null>(null);
  const stepByLetter = new Map(steps.map((s) => [s.letter, s]));

  // Bulle en plein écran : verrouille le défilement de la page derrière, et
  // permet de fermer au clavier (Échap), comme n'importe quelle modale.
  useEffect(() => {
    if (!active) return;
    document.body.style.overflow = "hidden";
    function handleKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") setActive(null);
    }
    document.addEventListener("keydown", handleKeydown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeydown);
    };
  }, [active]);

  return (
    <ol className="perca-steps">
      {FIXED_STEPS.map(([letter, word]) => {
        const step = stepByLetter.get(letter);
        const hasDetail = Boolean(step?.title || step?.body);
        const isActive = active === letter;
        return (
          <li key={letter} className="perca-step-item">
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
              <div className="perca-step-bubble" role="dialog" aria-label={step?.title || word}>
                <button
                  type="button"
                  className="perca-step-bubble-close"
                  onClick={() => setActive(null)}
                  aria-label="Fermer"
                >
                  ✕
                </button>
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
  );
}
