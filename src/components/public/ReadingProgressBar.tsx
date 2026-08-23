"use client";

import { useEffect, useLayoutEffect, useState } from "react";

// Barre de progression de lecture — pourcentage de défilement de la page,
// utilisée sur les contenus longs (productions, entrées de Journal). Se colle
// juste sous le header (mesuré à l'exécution : sa hauteur varie selon la
// largeur d'écran, plus fiable qu'une valeur en dur).
export function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(0);

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
    function onScroll() {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const value = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, value)));
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="reading-progress" style={{ top: headerHeight }} aria-hidden="true">
      <div className="reading-progress-bar" style={{ width: `${progress}%` }} />
    </div>
  );
}
