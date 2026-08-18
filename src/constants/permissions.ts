// Catalogue des permissions RBAC : section admin × action.
// La matrice éditable (Phase 3) coche ces clés par rôle ; l'admin les a toutes.

export type PermissionAction = "view" | "create" | "edit" | "delete" | "publish";

export type PermissionSection = {
  key: string; // identifiant technique (souvent = segment de route /admin/<key>)
  label: string;
  actions: PermissionAction[];
};

export const ACTION_LABELS: Record<PermissionAction, string> = {
  view: "Voir",
  create: "Créer",
  edit: "Modifier",
  delete: "Supprimer",
  publish: "Publier",
};

// Sections gérables par la matrice de rôles. (users / roles / historique = admin uniquement, hors matrice.)
export const permissionCatalog: PermissionSection[] = [
  { key: "themes", label: "Thèmes", actions: ["view", "create", "edit", "delete", "publish"] },
  { key: "sousthemes", label: "Sous-thèmes", actions: ["view", "create", "edit", "delete", "publish"] },
  { key: "auteurs", label: "Auteurs", actions: ["view", "create", "edit", "delete"] },
  { key: "activites", label: "Activités", actions: ["view", "create", "edit", "delete", "publish"] },
  { key: "productions", label: "Productions", actions: ["view", "create", "edit", "delete", "publish"] },
  { key: "projets", label: "Projets", actions: ["view", "create", "edit", "delete", "publish"] },
  { key: "journal", label: "Journal", actions: ["view", "create", "edit", "delete", "publish"] },
  { key: "dossiers", label: "Dossiers", actions: ["view", "create", "edit", "delete", "publish"] },
  { key: "media", label: "Médiathèque", actions: ["view", "create", "delete"] },
  { key: "forms", label: "Formulaires", actions: ["view", "edit", "delete"] },
  { key: "homepage", label: "Page d'accueil", actions: ["view", "edit"] },
  { key: "perca", label: "Page PERCA", actions: ["view", "edit"] },
  { key: "history", label: "Page Histoire", actions: ["view", "edit"] },
  { key: "pages", label: "Gestion des pages", actions: ["view", "edit"] },
  { key: "redirects", label: "Redirections", actions: ["view", "edit"] },
];

export function permKey(section: string, action: string): string {
  return `${section}:${action}`;
}

export function allPermissionKeys(): string[] {
  return permissionCatalog.flatMap((s) => s.actions.map((a) => permKey(s.key, a)));
}
