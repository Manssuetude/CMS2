"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { readSavedScrollProgress, saveScrollProgress } from "@/lib/readingProgress";

// Barre de progression de lecture — pourcentage de défilement de la page,
// utilisée sur les contenus longs (productions). Se colle juste sous le
// header (mesuré à l'exécution : sa hauteur varie selon la largeur d'écran,
// plus fiable qu'une valeur en dur).
//
// Retient aussi la position de lecture par production (localStorage, aucun
// cookie) pour proposer de reprendre là où le visiteur s'était arrêté.
export function ReadingProgressBar({ slug }: { slug?: string }) {
  const [progress, setProgress] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [resumePercent, setResumePercent] = useState<number | null>(null);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useLayoutEffect(() => {
    function measureHeader() {
      const header = document.querySelector(".site-header");
      if (header) setHeaderHeight(header.getBoundingClientRect().height);
    }
    measureHeader();
    window.addEventListener("resize", measureHeader);
    return () => window.removeEventListener("resize", measureHeader);
  }, []);

  useEffect(() => {
    if (slug) setResumePercent(readSavedScrollProgress(slug));
  }, [slug]);

  useEffect(() => {
    function onScroll() {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const value = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
      const clamped = Math.min(100, Math.max(0, value));
      setProgress(clamped);

      if (!slug) return;
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(() => saveScrollProgress(slug, clamped), 500);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, [slug]);

  function resume() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    if (resumePercent != null && scrollable > 0) {
      window.scrollTo({ top: (resumePercent / 100) * scrollable, behavior: "smooth" });
    }
    setResumePercent(null);
  }

  return (
    <>
      <div className="reading-progress" style={{ top: headerHeight }} aria-hidden="true">
        <div className="reading-progress-bar" style={{ width: `${progress}%` }} />
      </div>
      {resumePercent != null && (
        <div className="reading-resume-banner" role="status">
          <span>Vous aviez commencé cette lecture.</span>
          <div className="reading-resume-actions">
            <button type="button" className="reading-resume-accept" onClick={resume}>
              Reprendre
            </button>
            <button type="button" className="reading-resume-dismiss" onClick={() => setResumePercent(null)}>
              Recommencer
            </button>
          </div>
        </div>
      )}
    </>
  );
}
