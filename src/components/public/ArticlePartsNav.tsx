"use client";

import { useCallback, useEffect, useId, useRef, useState, type MouseEvent } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { readingPercent, type PartsMenuItem } from "@/utils/articleParts";

interface Props {
  typeLabel: string;
  shortTitle: string;
  /** Parties ; seule la partie ouverte porte ses sous-titres (buildPartsMenu). */
  parts: PartsMenuItem[];
  /** Poids de lecture de chaque partie (longueur du texte). */
  weights: number[];
  currentIndex: number;
}

const MOBILE_QUERY = "(max-width: 899px)";
// Marge sous le header (et sous la barre sur téléphone) à partir de laquelle
// un titre est considéré comme « passé ».
const ACTIVE_OFFSET = 24;

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Navigation entre les parties d'un article. Ordinateur : colonne collante
// (liste toujours visible, sous-titres de la partie ouverte dépliés).
// Téléphone : barre collante sous le header, un bouton déplie/replie la même
// liste. La progression suit la lecture réelle, pondérée par la longueur des
// parties (rendu serveur : début de la partie ouverte).
export function ArticlePartsNav({ typeLabel, shortTitle, parts, weights, currentIndex }: Props) {
  const [open, setOpen] = useState(false);
  const [fraction, setFraction] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const navId = useId();
  const asideRef = useRef<HTMLElement>(null);
  const total = parts.length;
  const current = parts[currentIndex];
  const headingIds = (current?.headings ?? []).map((h) => h.id).join("|");
  const percent = readingPercent(weights, currentIndex, fraction);

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

  /**
   * Hauteur couverte en haut de l'écran une fois la page défilée : le header
   * collant (sa hauteur, pas sa position : le bandeau d'annonce au-dessus
   * sort de l'écran en défilant), plus la barre collante sur téléphone.
   */
  const topOffset = useCallback(() => {
    const header = document.querySelector<HTMLElement>(".site-header");
    let offset = header ? header.getBoundingClientRect().height : 0;
    if (window.matchMedia(MOBILE_QUERY).matches) {
      const toggle = asideRef.current?.querySelector<HTMLElement>(".article-parts-toggle");
      offset += toggle?.getBoundingClientRect().height ?? 0;
    }
    return offset;
  }, []);

  // Avancement dans la partie et sous-titre en cours, recalculés au défilement
  // (une fois par image) et au redimensionnement.
  useEffect(() => {
    const body = document.querySelector<HTMLElement>(".article-part-body");
    if (!body) return;
    const headings = headingIds
      ? headingIds
          .split("|")
          .map((id) => document.getElementById(id))
          .filter((el): el is HTMLElement => !!el && body.contains(el))
      : [];
    let frame = 0;

    const measure = () => {
      frame = 0;
      const offset = topOffset();
      const rect = body.getBoundingClientRect();
      const visible = window.innerHeight - offset;
      const travel = rect.height - visible;
      let next: number;
      if (travel <= 0) next = rect.top <= offset ? 1 : 0;
      else next = (offset - rect.top) / travel;
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
      rootMargin: `-${Math.round(topOffset() + ACTIVE_OFFSET)}px 0px 0px 0px`,
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
  }, [headingIds, currentIndex, total, topOffset]);

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
        const top = target.getBoundingClientRect().top + window.scrollY - topOffset() - 12;
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
