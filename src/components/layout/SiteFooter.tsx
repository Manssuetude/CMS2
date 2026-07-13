import Link from "next/link";
import type { FooterConfig } from "@/types/cms";

const defaultColumns = [
  {
    title: "L'association",
    links: [
      { label: "À propos", url: "/a-propos" },
      { label: "Nous rejoindre", url: "/nous-rejoindre" },
      { label: "Nous soutenir", url: "/nous-soutenir" },
    ],
  },
];

export function SiteFooter({ config }: { config?: FooterConfig }) {
  const footer = config || {};
  const columns = footer.columns?.length ? footer.columns : defaultColumns;
  const links = columns.flatMap((column) => column.links || []);
  const description = footer.description || "Un espace de réflexion, de production et d'expérimentation collective.";

  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <strong className="footer-name">Manssuétude</strong>
        <nav className="footer-links" aria-label="Liens de pied de page">
          {links.map((link) => (
            <Link key={link.url} href={link.url}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Manssuétude</span>
        <span>{description}</span>
      </div>
    </footer>
  );
}
