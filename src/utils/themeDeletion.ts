// Suppression d'un thème. `sub_themes.theme_id` est en ON DELETE CASCADE :
// supprimer un thème qui a des sous-thèmes ferait disparaître ces sous-thèmes
// et leurs liens (productions, événements). La suppression est donc refusée
// tant qu'il en reste : il faut les rattacher à un autre thème, ou archiver
// le thème. Sans sous-thème, la suppression retire le thème des événements
// et projets liés (liens en cascade), et laisse sans thème le journal et les
// ressources (SET NULL).

export type ThemeDeletionCheck =
  | { allowed: false; reason: "sub-themes"; subThemeCount: number }
  | { allowed: true; eventCount: number; projectCount: number };

export function checkThemeDeletion(input: {
  subThemeCount: number;
  eventCount: number;
  projectCount: number;
}): ThemeDeletionCheck {
  if (input.subThemeCount > 0) return { allowed: false, reason: "sub-themes", subThemeCount: input.subThemeCount };
  return { allowed: true, eventCount: input.eventCount, projectCount: input.projectCount };
}

const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`;

/** Texte de confirmation d'une suppression autorisée. */
export function themeDeletionSummary(title: string, eventCount: number, projectCount: number): string {
  const links = [
    eventCount ? plural(eventCount, "événement", "événements") : null,
    projectCount ? plural(projectCount, "projet", "projets") : null,
  ].filter(Boolean);
  const detached = links.length ? ` Il sera retiré de ${links.join(" et ")}.` : "";
  return `Supprimer « ${title} » ?${detached} La suppression est définitive.`;
}
