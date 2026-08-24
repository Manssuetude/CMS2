"use client";

import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";

// Bouton loupe dans le header public : ouvre un petit champ en popover (pas
// de recherche live/API — soumission classique en GET vers /recherche, qui
// fait déjà tout le travail côté serveur) plutôt qu'une nouvelle page dédiée.
export function HeaderSearch() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    function handleClickOutside(event: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) setOpen(false);
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div className="header-search-wrap" ref={wrapRef}>
      <button
        type="button"
        className="header-search-toggle"
        aria-label="Rechercher"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <Search size={17} strokeWidth={1.75} aria-hidden />
      </button>
      {open && (
        <form className="header-search" action="/recherche" method="get" role="search">
          <input ref={inputRef} type="search" name="q" placeholder="Rechercher…" aria-label="Rechercher" />
          <button type="submit" className="header-search-submit" aria-label="Lancer la recherche">
            <Search size={16} strokeWidth={2} aria-hidden />
          </button>
        </form>
      )}
    </div>
  );
}
