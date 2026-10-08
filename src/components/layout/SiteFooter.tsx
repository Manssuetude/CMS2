import Link from "next/link";
import type { FooterConfig } from "@/types/cms";
import { CONTACT_EMAIL, RNA_NUMBER } from "@/constants/site";
import { InstagramIcon, TikTokIcon, LinkedInIcon } from "@/components/icons/BrandIcons";

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
      { label: "Politique cookies", url: "/politique-cookies" },
    ],
  },
];

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
          © {new Date().getFullYear()} Manssuétude · Association à but non lucratif · RNA {RNA_NUMBER} ·{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </span>
        <span>{description}</span>
      </div>
    </footer>
  );
}
