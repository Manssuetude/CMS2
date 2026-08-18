"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { MAIN_NAV_ITEMS, MEMBER_SPACE_URL } from "@/constants/site";
import type { NavVisibility } from "@/types/cms";

export function SiteHeader({
  logoUrl,
  navVisibility = {},
}: {
  logoUrl?: string | null;
  navVisibility?: NavVisibility;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const nav = MAIN_NAV_ITEMS.filter((item) => !item.togglable || navVisibility[item.key] !== false).map(
    (item) => [item.label, item.key] as const,
  );

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
          <Link className="support-link" href="/nous-soutenir" onClick={() => setOpen(false)}>
            Nous soutenir
          </Link>
          <ThemeToggle />
          <Link className="cta" href="/nous-rejoindre" onClick={() => setOpen(false)}>
            Rejoindre
          </Link>
          <a className="cta" href={MEMBER_SPACE_URL} target="_blank" rel="noopener noreferrer">
            Espace membre
          </a>
        </div>
      </nav>
    </header>
  );
}
