import Link from "next/link";

const nav = [
  ["Accueil", "/"],
  ["Thèmes", "/themes"],
  ["Activités", "/activites"],
  ["Productions", "/productions"],
  ["Projets", "/projets"],
  ["PERCA", "/perca"],
  ["À propos", "/a-propos"],
  ["Nous soutenir", "/nous-soutenir"],
];

export function SiteHeader({ logoUrl }: { logoUrl?: string | null }) {
  return (
    <header className="site-header">
      <Link className="brand" href="/">
        {logoUrl ? <img src={logoUrl} alt="Manssuétude" /> : <span>Manssuétude</span>}
      </Link>
      <nav className="nav" aria-label="Navigation principale">
        {nav.map(([label, href]) => (
          <Link key={href} href={href}>
            {label}
          </Link>
        ))}
        <Link className="cta" href="/nous-rejoindre">
          Rejoindre
        </Link>
      </nav>
    </header>
  );
}
