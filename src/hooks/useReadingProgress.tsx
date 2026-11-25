"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { readingPercent } from "@/utils/articleParts";

// Progression de lecture d'un article par parties, partagée par le menu des
// parties (ArticlePartsNav) et la colonne outils (ArticleReadingTools) : un
// seul écouteur de défilement, des chiffres identiques partout. Rendu serveur :
// fraction 0 (début de la partie ouverte), puis mise à jour au défilement.

const MOBILE_QUERY = "(max-width: 899px)";
/** Marge sous le haut de l'écran à partir de laquelle un titre est « passé ». */
const ACTIVE_OFFSET = 24;

type ReadingProgress = {
  /** Progression dans tout l'article, 0–100, pondérée par la longueur des parties. */
  percent: number;
  /** Avancement dans la partie ouverte, 0–1. */
  fraction: number;
  /** Sous-titre (h3) en cours de lecture. */
  activeId: string | null;
};

const ReadingProgressContext = createContext<ReadingProgress>({ percent: 0, fraction: 0, activeId: null });

export function useReadingProgress(): ReadingProgress {
  return useContext(ReadingProgressContext);
}

/**
 * Hauteur couverte en haut de l'écran une fois la page défilée : le header
 * collant (sa hauteur, pas sa position : le bandeau d'annonce au-dessus sort
 * de l'écran en défilant), plus la barre « Dans cet article » sur téléphone.
 */
export function readingTopOffset(): number {
  const header = document.querySelector<HTMLElement>(".site-header");
  let offset = header ? header.getBoundingClientRect().height : 0;
  if (window.matchMedia(MOBILE_QUERY).matches) {
    const toggle = document.querySelector<HTMLElement>(".article-parts-toggle");
    offset += toggle?.getBoundingClientRect().height ?? 0;
  }
  return offset;
}

interface ProviderProps {
  /** Poids de lecture de chaque partie (vide : pas de texte à lire). */
  weights: number[];
  currentIndex: number;
  /** Identifiants des sous-titres suivis (ceux du menu de la partie ouverte). */
  headingIds: string[];
  children: ReactNode;
}

export function ReadingProgressProvider({ weights, currentIndex, headingIds, children }: ProviderProps) {
  const [fraction, setFraction] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const total = weights.length;
  const headingKey = headingIds.join("|");

  // Le header du site est collant et sa hauteur varie selon la largeur d'écran :
  // mesurée pour coller les colonnes (et la barre sur téléphone) juste en dessous.
  useEffect(() => {
    const header = document.querySelector<HTMLElement>(".site-header");
    if (!header) return;
    const root = document.documentElement;
    const apply = () => root.style.setProperty("--article-header-h", `${header.getBoundingClientRect().height}px`);
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(header);
    return () => {
      observer.disconnect();
      root.style.removeProperty("--article-header-h");
    };
  }, []);

  useEffect(() => {
    const body = document.querySelector<HTMLElement>(".article-part-body");
    if (!body || total === 0) return;
    const headings = headingKey
      ? headingKey
          .split("|")
          .map((id) => document.getElementById(id))
          .filter((el): el is HTMLElement => !!el && body.contains(el))
      : [];
    let frame = 0;

    const measure = () => {
      frame = 0;
      const offset = readingTopOffset();
      const rect = body.getBoundingClientRect();
      const travel = rect.height - (window.innerHeight - offset);
      let next = travel <= 0 ? (rect.top <= offset ? 1 : 0) : (offset - rect.top) / travel;
      // Dernière partie : bas de page atteint = tout est lu.
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (currentIndex === total - 1 && atBottom) next = 1;
      setFraction(Math.min(1, Math.max(0, next)));

      let active: string | null = null;
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top - offset <= ACTIVE_OFFSET) active = heading.id;
      }
      setActiveId(active);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    // Les titres qui passent sous le haut de l'écran déclenchent aussi le recalcul.
    const observer = new IntersectionObserver(schedule, {
      rootMargin: `-${Math.round(readingTopOffset() + ACTIVE_OFFSET)}px 0px 0px 0px`,
      threshold: [0, 1],
    });
    headings.forEach((heading) => observer.observe(heading));

    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [headingKey, currentIndex, total]);

  const percent = readingPercent(weights, currentIndex, fraction);
  const value = useMemo(() => ({ percent, fraction, activeId }), [percent, fraction, activeId]);
  return <ReadingProgressContext.Provider value={value}>{children}</ReadingProgressContext.Provider>;
}
