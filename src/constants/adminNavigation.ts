export type AdminModule = {
  id: string;
  label: string;
};

export const adminModules: AdminModule[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "themes", label: "Thèmes" },
  { id: "activites", label: "Activités" },
  { id: "productions", label: "Productions" },
  { id: "projets", label: "Projets" },
  { id: "media", label: "Médiathèque" },
  { id: "forms", label: "Formulaires reçus" },
];
