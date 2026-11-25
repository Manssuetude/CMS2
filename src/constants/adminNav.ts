// Menu de l'admin, regroupé. `permission` : section dont le droit « :view »
// est requis (absent = visible par tous). `adminOnly` : réservé aux
// administrateurs. `hideWhenEmpty` : section masquée tant qu'elle est vide
// (réaffichable par la ligne « Sections vides masquées »).

export type AdminNavItemId =
  | "dashboard"
  | "evenements"
  | "productions"
  | "projets"
  | "annonces"
  | "journal"
  | "dossiers"
  | "themes"
  | "sousthemes"
  | "formatsactivites"
  | "auteurs"
  | "homepage"
  | "a-propos"
  | "nous-rejoindre"
  | "perca"
  | "history"
  | "pages"
  | "forms"
  | "media"
  | "users"
  | "roles"
  | "links"
  | "historique";

export type AdminNavItem = {
  id: AdminNavItemId;
  label: string;
  href: string;
  permission?: string;
  adminOnly?: boolean;
  hideWhenEmpty?: "journal" | "dossiers";
};

export type AdminNavGroup = {
  id: "contenus" | "organisation" | "pages" | "reception" | "reglages";
  label: string;
  /** Replié tant que l'utilisateur ne l'a pas ouvert. */
  collapsedByDefault?: boolean;
  items: AdminNavItem[];
};

export const ADMIN_NAV_DASHBOARD: AdminNavItem = {
  id: "dashboard",
  label: "Tableau de bord",
  href: "/admin/dashboard",
};

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    id: "contenus",
    label: "Contenus",
    items: [
      { id: "evenements", label: "Événements", href: "/admin/evenements", permission: "evenements" },
      { id: "productions", label: "Productions", href: "/admin/productions", permission: "productions" },
      { id: "projets", label: "Projets", href: "/admin/projets", permission: "projets" },
      { id: "annonces", label: "Annonces", href: "/admin/annonces", permission: "annonces" },
      { id: "journal", label: "Journal", href: "/admin/journal", permission: "journal", hideWhenEmpty: "journal" },
      { id: "dossiers", label: "Dossiers", href: "/admin/dossiers", permission: "dossiers", hideWhenEmpty: "dossiers" },
    ],
  },
  {
    id: "organisation",
    label: "Organisation",
    items: [
      { id: "themes", label: "Thèmes", href: "/admin/themes", permission: "themes" },
      { id: "sousthemes", label: "Sous-thèmes", href: "/admin/sousthemes", permission: "sousthemes" },
      {
        id: "formatsactivites",
        label: "Formats d'activités",
        href: "/admin/formatsactivites",
        permission: "formatsactivites",
      },
      { id: "auteurs", label: "Auteurs", href: "/admin/auteurs", permission: "auteurs" },
    ],
  },
  {
    id: "pages",
    label: "Pages du site",
    items: [
      { id: "homepage", label: "Accueil", href: "/admin/homepage", permission: "homepage" },
      { id: "a-propos", label: "À propos", href: "/admin/pages/a-propos", permission: "pages" },
      { id: "nous-rejoindre", label: "Nous rejoindre", href: "/admin/pages/nous-rejoindre", permission: "pages" },
      { id: "perca", label: "PERCA", href: "/admin/perca", permission: "perca" },
      { id: "history", label: "Histoire", href: "/admin/history", permission: "history" },
      { id: "pages", label: "Menu du site", href: "/admin/pages", permission: "pages" },
    ],
  },
  {
    id: "reception",
    label: "Réception et fichiers",
    items: [
      { id: "forms", label: "Formulaires reçus", href: "/admin/forms", permission: "forms" },
      { id: "media", label: "Médiathèque", href: "/admin/media", permission: "media" },
    ],
  },
  {
    id: "reglages",
    label: "Réglages",
    collapsedByDefault: true,
    items: [
      { id: "users", label: "Utilisateurs", href: "/admin/users", adminOnly: true },
      { id: "roles", label: "Rôles", href: "/admin/roles", adminOnly: true },
      { id: "links", label: "Page de liens", href: "/admin/links", permission: "links" },
      { id: "historique", label: "Journal des modifications", href: "/admin/historique", adminOnly: true },
    ],
  },
];
