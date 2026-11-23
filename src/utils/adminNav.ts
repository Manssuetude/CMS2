import type { AdminNavGroup, AdminNavItem } from "@/constants/adminNav";

// Règles pures du menu de l'admin (droits, sections vides, entrée active).

export type NavAccess = { isAdmin: boolean; permissions: string[] };
export type EmptySections = { journal: boolean; dossiers: boolean };

export function canSeeNavItem(item: AdminNavItem, access: NavAccess): boolean {
  if (item.adminOnly) return access.isAdmin;
  if (!item.permission) return true;
  return access.isAdmin || access.permissions.includes(`${item.permission}:view`);
}

/** Groupes visibles pour ce rôle ; les sections vides sont retirées sauf si `showEmpty`. */
export function visibleNavGroups(
  groups: AdminNavGroup[],
  access: NavAccess,
  empty: EmptySections,
  showEmpty: boolean,
): AdminNavGroup[] {
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => canSeeNavItem(item, access) && (showEmpty || !item.hideWhenEmpty || !empty[item.hideWhenEmpty]),
      ),
    }))
    .filter((group) => group.items.length > 0);
}

/** Libellés des sections vides masquées que ce rôle pourrait voir (« Journal, Dossiers »). */
export function hiddenEmptySections(groups: AdminNavGroup[], access: NavAccess, empty: EmptySections): string[] {
  return groups
    .flatMap((group) => group.items)
    .filter((item) => item.hideWhenEmpty && empty[item.hideWhenEmpty] && canSeeNavItem(item, access))
    .map((item) => item.label);
}

/** Entrée active : celle dont le lien est le plus long préfixe du chemin courant. */
export function activeNavHref(pathname: string, hrefs: string[]): string | null {
  if (pathname === "/admin") return "/admin/dashboard";
  let best: string | null = null;
  for (const href of hrefs) {
    const matches = pathname === href || pathname.startsWith(`${href}/`);
    if (matches && (!best || href.length > best.length)) best = href;
  }
  return best;
}
