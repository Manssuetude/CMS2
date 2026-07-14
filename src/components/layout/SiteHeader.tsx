"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

const nav = [
  ["Accueil", "/"],
  ["Thèmes", "/themes"],
  ["Activités", "/activites"],
  ["Productions", "/productions"],
  ["Projets", "/projets"],
  ["À propos", "/a-propos"],
] as const;

export function SiteHeader({ logoUrl }: { logoUrl?: string | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const raw = new FormData(event.currentTarget).get("q");
    const query = String(raw ?? "").trim();
    setSearchOpen(false);
    setOpen(false);
    router.push(query ? `/recherche?q=${encodeURIComponent(query)}` : "/recherche");
  }

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="site-header">
      <Link className="brand" href="/" onClick={() => setOpen(false)}>
        {logoUrl ? <img src={logoUrl} alt="Manssuétude" /> : <span>Manssuétude</span>}
      </Link>

      <button
        type="button"
        className="nav-toggle"
        aria-label="Ouvrir le menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span />
        <span />
        <span />
      </button>

      <nav className="site-nav" data-open={open} aria-label="Navigation principale">
        <div className="links">
          {nav.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(href) ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
        </div>
        <div className="header-actions">
          <div className="header-search-wrap">
            <button
              type="button"
              className="header-search-toggle"
              aria-label="Rechercher"
              aria-expanded={searchOpen}
              onClick={() => setSearchOpen((v) => !v)}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
            {searchOpen && (
              <form className="header-search" role="search" onSubmit={submitSearch}>
                <input
                  type="search"
                  name="q"
                  placeholder="Rechercher…"
                  aria-label="Rechercher sur le site"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setSearchOpen(false);
                  }}
                />
                <button type="submit" className="header-search-submit" aria-label="Lancer la recherche">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden
                  >
                    <circle cx="11" cy="11" r="7" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </button>
              </form>
            )}
          </div>
          <ThemeToggle />
          <Link className="support-link" href="/nous-soutenir" onClick={() => setOpen(false)}>
            Nous soutenir
          </Link>
          <Link className="cta" href="/nous-rejoindre" onClick={() => setOpen(false)}>
            Rejoindre
          </Link>
        </div>
      </nav>
    </header>
  );
}
