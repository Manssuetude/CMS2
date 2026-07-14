"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const [open, setOpen] = useState(false);

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
          <form
            className="header-search"
            action="/recherche"
            method="get"
            role="search"
            onSubmit={() => setOpen(false)}
          >
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
            <input type="search" name="q" placeholder="Rechercher…" aria-label="Rechercher sur le site" />
          </form>
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
