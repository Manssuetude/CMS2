// Identité du site pour le SEO (metadataBase, sitemap, robots, données structurées).
// L'URL canonique de production est fixe (domaine de marque) ; on la surcharge via
// NEXT_PUBLIC_SITE_URL uniquement si la variable pointe vers une URL non-localhost
// (utile pour les previews Vercel). En local, on garde l'URL de production pour que
// les balises SEO générées restent cohérentes.
const PRODUCTION_URL = "https://www.manssuetude.com";

function resolveSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv && !fromEnv.includes("localhost") && !fromEnv.includes("127.0.0.1")) {
    return fromEnv.replace(/\/$/, "");
  }
  return PRODUCTION_URL;
}

export const SITE_URL = resolveSiteUrl();

export const SITE_NAME = "Manssuétude";

export const SITE_DESCRIPTION = "Un espace de réflexion, de production et d'expérimentation collective.";

// Chemin (relatif) du logo utilisé pour les partages et les données structurées.
export const SITE_LOGO = "/assets/photos/logo-manssuetude.png";

// Profils sociaux officiels (source visuelle : SiteFooter). Injectés dans le
// `sameAs` du JSON-LD Organization pour renforcer la fiche de marque Google.
export const SITE_SOCIALS = [
  "https://www.instagram.com/manssuetude",
  "https://www.tiktok.com/@manssuetude",
  "https://linkedin.com/company/manssu%C3%A9tude",
];

// Portail membre, sous-domaine séparé (hors de ce dépôt). Lien affiché dans le
// header et le footer publics (SiteHeader, SiteFooter).
export const MEMBER_SPACE_URL = "https://membre.manssuetude.com";

// Grandes pages du header public. Source unique partagée entre SiteHeader (rendu)
// et /admin/pages (activer/désactiver la visibilité dans le menu). "Accueil" n'est
// pas togglable : retirer l'entrée d'accueil du menu n'a pas de sens.
// `placement` distingue les liens de la barre principale ("nav") du lien
// "Nous soutenir" ("cta"), affiché à part dans le header mais togglable de la
// même façon depuis l'admin.
export const MAIN_NAV_ITEMS = [
  { key: "/", label: "Accueil", togglable: false, placement: "nav" },
  { key: "/themes", label: "Thèmes", togglable: true, placement: "nav" },
  { key: "/activites", label: "Activités", togglable: true, placement: "nav" },
  { key: "/productions", label: "Productions", togglable: true, placement: "nav" },
  { key: "/projets", label: "Projets", togglable: true, placement: "nav" },
  { key: "/journal", label: "Journal", togglable: true, placement: "nav" },
  { key: "/dossiers", label: "Dossiers", togglable: true, placement: "nav" },
  { key: "/a-propos", label: "À propos", togglable: true, placement: "nav" },
  { key: "/nous-soutenir", label: "Nous soutenir (lien d'en-tête)", togglable: true, placement: "cta" },
] as const;
