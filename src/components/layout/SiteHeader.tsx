"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { HeaderSearch } from "@/components/layout/HeaderSearch";
import { MAIN_NAV_ITEMS, MEMBER_SPACE_URL } from "@/constants/site";
import type { NavVisibility } from "@/types/cms";

export function SiteHeader({
  logoUrl,
  navVisibility = {},
  joinBadge = null,
}: {
  logoUrl?: string | null;
  navVisibility?: NavVisibility;
  // Pastille sur « Rejoindre » pendant une annonce (ex. « OUVERT »).
  joinBadge?: string | null;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const isVisible = (item: (typeof MAIN_NAV_ITEMS)[number]) => !item.togglable || navVisibility[item.key] !== false;
  const nav = MAIN_NAV_ITEMS.filter((item) => item.placement === "nav" && isVisible(item)).map(
    (item) => [item.label, item.key] as const,
  );
  const showSupportLink = MAIN_NAV_ITEMS.some((item) => item.key === "/nous-soutenir" && isVisible(item));

  return (
    <header className="site-header">
      <Link className="brand" href="/" onClick={() => setOpen(false)}>
        {logoUrl ? (
          <img src={logoUrl} alt="Manssuétude" width={54} height={54} decoding="async" />
        ) : (
          <span>Manssuétude</span>
        )}
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
          {showSupportLink && (
            <Link className="support-link" href="/nous-soutenir" onClick={() => setOpen(false)}>
              Nous soutenir
            </Link>
          )}
          <HeaderSearch />
          <ThemeToggle />
          <Link
            className={`cta${joinBadge ? " cta--badged" : ""}`}
            href="/nous-rejoindre"
            onClick={() => setOpen(false)}
          >
            Rejoindre
            {joinBadge ? <span className="cta-badge">{joinBadge}</span> : null}
          </Link>
          <a className="cta" href={MEMBER_SPACE_URL} target="_blank" rel="noopener noreferrer">
            Espace membre
          </a>
        </div>
      </nav>
    </header>
  );
}
