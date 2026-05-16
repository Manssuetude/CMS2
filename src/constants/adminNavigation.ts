export type AdminModule = {
  id: string;
  label: string;
};

export const adminModules: AdminModule[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "pages", label: "Pages" },
  { id: "homepage", label: "Homepage" },
  { id: "navigation", label: "Navigation" },
  { id: "themes", label: "Thèmes" },
  { id: "activites", label: "Activités" },
  { id: "productions", label: "Productions" },
  { id: "projets", label: "Projets" },
  { id: "resources", label: "Resources" },
  { id: "media", label: "Médiathèque" },
  { id: "forms", label: "Formulaires reçus" },
  { id: "identity", label: "Identité visuelle" },
  { id: "footer", label: "Footer" },
  { id: "design-system", label: "Design System" },
  { id: "seo", label: "SEO" },
  { id: "settings", label: "Paramètres" },
  { id: "backup", label: "Export / Import" },
];
