"use client";

import { useState, useEffect, useCallback } from "react";
import { X, ChevronRight, ChevronLeft } from "lucide-react";

type Step = {
  id: string;
  title: string;
  body: string;
  target?: string;
  placement?: "top" | "bottom" | "left" | "right" | "center";
};

const STEPS: Step[] = [
  {
    id: "bienvenue",
    title: "Bienvenue dans l'administration",
    body: "Ce guide vous présente l'essentiel en quelques étapes. Vous pouvez le relancer à tout moment via le bouton « ? » en bas de la barre latérale.",
    placement: "center",
  },
  {
    id: "navigation",
    title: "Navigation principale",
    body: "Accédez aux Activités, Productions, Projets, Médiathèque et Formulaires depuis cette barre. La section active est mise en surbrillance.",
    target: "tour-nav",
    placement: "right",
  },
  {
    id: "contenu",
    title: "Créer du contenu",
    body: "Chaque section dispose d'un bouton « Nouveau... » pour créer une entrée. Les brouillons ne sont jamais visibles sur le site public.",
    target: "tour-create",
    placement: "right",
  },
  {
    id: "mediatheque",
    title: "Médiathèque",
    body: "Importez vos images, PDF et vidéos ici. Tous vos médias sont réutilisables dans les formulaires de contenu. La recherche est instantanée.",
    target: "tour-media",
    placement: "right",
  },
  {
    id: "editeur",
    title: "Éditeur de page",
    body: "L'éditeur Homepage compose la structure de la page d'accueil par blocs. Réorganisez-les, modifiez leurs réglages, puis publiez.",
    target: "tour-editor",
    placement: "right",
  },
];

const STORAGE_KEY = "manssuetude_tour_v1";

function getTargetRect(target?: string): DOMRect | null {
  if (!target) return null;
  const el = document.querySelector(`[data-tour="${target}"]`);
  if (!el) return null;
  return el.getBoundingClientRect();
}

function computePosition(rect: DOMRect | null, placement: Step["placement"]): React.CSSProperties {
  if (!rect || placement === "center") {
    return {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
    };
  }

  const GAP = 16;

  if (placement === "right") {
    return {
      position: "fixed",
      top: Math.min(rect.top, window.innerHeight - 260),
      left: rect.right + GAP,
      transform: "none",
    };
  }
  if (placement === "bottom") {
    return {
      position: "fixed",
      top: rect.bottom + GAP,
      left: Math.max(8, rect.left),
      transform: "none",
    };
  }
  if (placement === "top") {
    return {
      position: "fixed",
      top: rect.top - GAP - 200,
      left: Math.max(8, rect.left),
      transform: "none",
    };
  }
  if (placement === "left") {
    return {
      position: "fixed",
      top: Math.min(rect.top, window.innerHeight - 260),
      right: window.innerWidth - rect.left + GAP,
      transform: "none",
    };
  }

  return { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
}

export function OnboardingTour() {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);

  const current = STEPS[step];
  const targetRect = active ? getTargetRect(current.target) : null;
  const bubbleStyle = computePosition(targetRect, current.placement ?? "center");

  const start = useCallback(() => {
    setStep(0);
    setActive(true);
  }, []);

  const close = useCallback(() => {
    setActive(false);
    try {
      localStorage.setItem(STORAGE_KEY, "done");
    } catch (_) {
      // localStorage indisponible (mode prive ou restrictions navigateur)
    }
  }, []);

  const next = useCallback(() => {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else close();
  }, [step, close]);

  const prev = useCallback(() => {
    if (step > 0) setStep((s) => s - 1);
  }, [step]);

  useEffect(() => {
    const handler = () => start();
    window.addEventListener("manssuetude:tour:start", handler);
    return () => window.removeEventListener("manssuetude:tour:start", handler);
  }, [start]);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        const t = setTimeout(() => setActive(true), 900);
        return () => clearTimeout(t);
      }
    } catch (_) {
      // localStorage indisponible
    }
  }, []);

  if (!active) return null;

  return (
    <>
      <div className="tour-overlay" onClick={close} aria-hidden="true" />

      <div
        className={`tour-bubble placement-${current.placement ?? "center"}`}
        style={bubbleStyle}
        role="dialog"
        aria-modal="true"
        aria-label={current.title}
      >
        <div className="tour-bubble-header">
          <span className="tour-step-count">
            {step + 1} / {STEPS.length}
          </span>
          <button className="tour-close" type="button" onClick={close} aria-label="Fermer le guide">
            <X size={14} />
          </button>
        </div>

        <h3 className="tour-title">{current.title}</h3>
        <p className="tour-body">{current.body}</p>

        <div className="tour-actions">
          {step > 0 ? (
            <button type="button" className="button" onClick={prev}>
              <ChevronLeft size={14} />
              Précédent
            </button>
          ) : (
            <span />
          )}
          <button type="button" className="button primary" onClick={next}>
            {step < STEPS.length - 1 ? (
              <>
                Suivant
                <ChevronRight size={14} />
              </>
            ) : (
              "Terminer"
            )}
          </button>
        </div>
      </div>
    </>
  );
}
