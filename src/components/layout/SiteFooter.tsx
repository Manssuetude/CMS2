import Link from "next/link";
import type { FooterConfig } from "@/types/cms";
import { MEMBER_SPACE_URL, RNA_NUMBER } from "@/constants/site";

const defaultColumns = [
  {
    title: "L'association",
    links: [
      { label: "À propos", url: "/a-propos" },
      { label: "Nous rejoindre", url: "/nous-rejoindre" },
      { label: "Nous soutenir", url: "/nous-soutenir" },
    ],
  },
  {
    title: "Informations légales",
    links: [
      { label: "Mentions légales", url: "/mentions-legales" },
      { label: "Politique de confidentialité", url: "/politique-de-confidentialite" },
    ],
  },
];

// Icônes réseaux sociaux (SVG inline pour ne dépendre d'aucune librairie d'icônes).
type IconProps = { size?: number };

function InstagramIcon({ size = 18 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      aria-hidden
      focusable="false"
    >
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TikTokIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable="false">
      <path d="M16.5 3c.32 2.13 1.6 3.62 3.5 3.86v2.63c-1.28.13-2.47-.29-3.5-1.02v6.88c0 3.18-2.57 5.65-5.68 5.65C7.68 21 5 18.4 5 15.29c0-3.02 2.4-5.52 5.4-5.62.32-.01.64.01.95.07v2.72a2.9 2.9 0 0 0-.9-.15c-1.6 0-2.82 1.28-2.82 2.88 0 1.6 1.22 2.9 2.82 2.9 1.6 0 2.9-1.24 2.9-2.9V3h3.15z" />
    </svg>
  );
}

function LinkedInIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable="false">
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-.95 1.83-1.95 3.77-1.95C20.4 8.75 21 11 21 14.1V21h-4v-6.1c0-1.45-.03-3.3-2.02-3.3-2.02 0-2.33 1.58-2.33 3.2V21H9z" />
    </svg>
  );
}

const socials = [
  { label: "Instagram", href: "https://www.instagram.com/manssuetude", Icon: InstagramIcon },
  { label: "TikTok", href: "https://www.tiktok.com/@manssuetude", Icon: TikTokIcon },
  { label: "LinkedIn", href: "https://linkedin.com/company/manssu%C3%A9tude", Icon: LinkedInIcon },
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
          {links.map((link) =>
            /^https?:\/\//.test(link.url) ? (
              <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer">
                {link.label}
              </a>
            ) : (
              <Link key={link.url} href={link.url}>
                {link.label}
              </Link>
            ),
          )}
        </nav>
        <a className="cta" href={MEMBER_SPACE_URL} target="_blank" rel="noopener noreferrer">
          Espace membre
        </a>
        <div className="footer-social">
          {socials.map(({ label, href, Icon }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label}>
              <Icon size={18} />
            </a>
          ))}
        </div>
      </div>
      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} Manssuétude — Association à but non lucratif — RNA {RNA_NUMBER}
        </span>
        <span>{description}</span>
      </div>
    </footer>
  );
}
