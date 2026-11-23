"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

export type ArticlePartLink = { title: string; href: string };

interface Props {
  typeLabel: string;
  shortTitle: string;
  parts: ArticlePartLink[];
  currentIndex: number;
  percent: number;
}

// Navigation entre les parties d'un article. Ordinateur : colonne collante
// (liste toujours visible). Téléphone : barre collante sous le header, un
// bouton déplie/replie la même liste (une seule <nav>, pas de doublon de liens).
export function ArticlePartsNav({ typeLabel, shortTitle, parts, currentIndex, percent }: Props) {
  const [open, setOpen] = useState(false);
  const navId = useId();
  const total = parts.length;
  const current = parts[currentIndex];

  // Le header du site est collant et sa hauteur varie selon la largeur
  // d'écran : mesurée pour coller la barre juste en dessous.
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
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <aside className={`article-parts${open ? " is-open" : ""}`}>
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
            </li>
          ))}
        </ol>
      </nav>

      <div className="article-parts-progress">
        <p>
          <span>
            Partie {currentIndex + 1} sur {total}
          </span>
          <span>{percent}&nbsp;%</span>
        </p>
        <span className="article-parts-progress-bar" aria-hidden="true">
          <span style={{ width: `${percent}%` }} />
        </span>
      </div>
    </aside>
  );
}
