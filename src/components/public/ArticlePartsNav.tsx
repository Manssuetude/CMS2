"use client";

import { useEffect, useId, useRef, useState, type MouseEvent } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { readingTopOffset, useReadingProgress } from "@/hooks/useReadingProgress";
import type { PartsMenuItem } from "@/utils/articleParts";

interface Props {
  typeLabel: string;
  shortTitle: string;
  /** Parties ; seule la partie ouverte porte ses sous-titres (buildPartsMenu). */
  parts: PartsMenuItem[];
  currentIndex: number;
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Navigation entre les parties d'un article. Ordinateur : colonne collante
// (liste toujours visible, sous-titres de la partie ouverte dépliés).
// Téléphone : barre collante sous le header, un bouton déplie/replie la même
// liste. La progression suit la lecture réelle, pondérée par la longueur des
// parties (useReadingProgress, partagé avec la colonne outils).
export function ArticlePartsNav({ typeLabel, shortTitle, parts, currentIndex }: Props) {
  const [open, setOpen] = useState(false);
  const { percent, activeId } = useReadingProgress();
  const navId = useId();
  const asideRef = useRef<HTMLElement>(null);
  const total = parts.length;
  const current = parts[currentIndex];

  // Sous-titre en cours hors de la zone visible de la colonne : on fait
  // défiler la colonne seulement (jamais la page).
  useEffect(() => {
    const aside = asideRef.current;
    if (!aside || !activeId || aside.scrollHeight <= aside.clientHeight) return;
    const link = aside.querySelector<HTMLElement>(`[data-heading="${CSS.escape(activeId)}"]`);
    if (!link) return;
    const asideRect = aside.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    if (linkRect.top < asideRect.top) aside.scrollTop -= asideRect.top - linkRect.top + 12;
    else if (linkRect.bottom > asideRect.bottom) aside.scrollTop += linkRect.bottom - asideRect.bottom + 12;
  }, [activeId]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Clic sur un sous-titre : le menu se referme (téléphone), puis la page
  // défile jusqu'au titre, en douceur sauf si l'animation est réduite.
  function goToHeading(event: MouseEvent<HTMLAnchorElement>, id: string) {
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    setOpen(false);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const top = target.getBoundingClientRect().top + window.scrollY - readingTopOffset() - 12;
        window.scrollTo({ top, behavior: prefersReducedMotion() ? "auto" : "smooth" });
        history.replaceState(null, "", `#${id}`);
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      }),
    );
  }

  return (
    <aside className={`article-parts${open ? " is-open" : ""}`} ref={asideRef}>
      <div className="article-parts-head">
        <p className="article-parts-type">{typeLabel}</p>
        <p className="article-parts-article">{shortTitle}</p>
      </div>

      <button
        type="button"
        className="article-parts-toggle"
        aria-expanded={open}
        aria-controls={navId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="article-parts-toggle-text">
          <span className="article-parts-toggle-label">Dans cet article · {percent}&nbsp;%</span>
          <span className="article-parts-toggle-title">{current?.title}</span>
        </span>
        <ChevronDown className="article-parts-toggle-icon" size={20} strokeWidth={2} aria-hidden="true" />
        <span className="article-parts-toggle-bar" aria-hidden="true">
          <span style={{ width: `${percent}%` }} />
        </span>
      </button>

      <nav id={navId} className="article-parts-nav" aria-label="Parties de l'article">
        <ol>
          {parts.map((part, index) => (
            <li key={part.href} className={index < currentIndex ? "is-read" : undefined}>
              <Link
                href={part.href}
                aria-current={index === currentIndex ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                <span className="article-parts-num" aria-hidden="true">
                  {index + 1}
                </span>
                <span className="sr-only">Partie {index + 1} : </span>
                <span>{part.title}</span>
              </Link>
              {part.headings.length > 0 && (
                <ul className="article-parts-sub" aria-label={`Sous-parties de « ${part.title} »`}>
                  {part.headings.map((heading) => (
                    <li key={heading.id}>
                      <a
                        href={`#${heading.id}`}
                        data-heading={heading.id}
                        aria-current={heading.id === activeId ? "location" : undefined}
                        onClick={(event) => goToHeading(event, heading.id)}
                      >
                        {heading.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <div className="article-parts-progress">
        <p>
          <span>
            Partie {currentIndex + 1} sur {total}
          </span>
          <span>{percent}&nbsp;% lu</span>
        </p>
        <span
          className="article-parts-progress-bar"
          role="progressbar"
          aria-label="Progression de la lecture"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
        >
          <span style={{ width: `${percent}%` }} />
        </span>
      </div>
    </aside>
  );
}
