import { needsEventReport } from "./eventReport";

// Règles du bloc « À faire » du tableau de bord. Pur : calculé à chaque
// chargement à partir des contenus, sans état enregistré. Une catégorie vide
// n'est pas renvoyée.

export const STALE_DRAFT_DAYS = 30;

export type TodoItem = { id: string; title: string; href: string };
export type TodoCategory = {
  id: "word" | "pdf" | "drafts" | "forms" | "event-photos";
  title: string;
  description: string;
  actionLabel: string;
  items: TodoItem[];
};

export type TodoSources = {
  productions: Array<{
    id: string;
    title: string;
    status: string;
    updatedAt: string;
    hasBody: boolean;
    hasPdf: boolean;
  }>;
  events: Array<{
    id: string;
    title: string;
    status: string;
    updatedAt: string;
    date: string | null;
    gallery: string[];
    documents: string[];
  }>;
  projects: Array<{ id: string; title: string; status: string; updatedAt: string }>;
  forms: Array<{ id: string; status: string; label: string }>;
};

const DAY_MS = 24 * 60 * 60 * 1000;

function isStaleDraft(item: { status: string; updatedAt: string }, now: Date): boolean {
  if (item.status !== "draft") return false;
  const updated = Date.parse(item.updatedAt);
  return Number.isFinite(updated) && now.getTime() - updated > STALE_DRAFT_DAYS * DAY_MS;
}

/** Statuts « non traités » d'un formulaire reçu. */
export const PENDING_FORM_STATUSES = ["reçu", "en cours"];

export function buildTodoList(sources: TodoSources, now: Date, today: string): TodoCategory[] {
  const published = sources.productions.filter((p) => p.status === "published");
  const editProduction = (id: string) => `/admin/productions/${id}/edit#fichiers`;

  const categories: TodoCategory[] = [
    {
      id: "word",
      title: "Productions publiées sans texte en ligne",
      description: "Elles s'affichent encore en lecteur PDF. Ajoutez leur Word pour la lecture par parties.",
      actionLabel: "Ajouter le Word",
      items: published.filter((p) => !p.hasBody).map((p) => ({ id: p.id, title: p.title, href: editProduction(p.id) })),
    },
    {
      id: "pdf",
      title: "Productions publiées sans PDF",
      description: "Le bouton « Télécharger le PDF » ne s'affiche pas.",
      actionLabel: "Ajouter le PDF",
      items: published.filter((p) => !p.hasPdf).map((p) => ({ id: p.id, title: p.title, href: editProduction(p.id) })),
    },
    {
      id: "drafts",
      title: "Brouillons à terminer ou à supprimer",
      description: `Non modifiés depuis plus de ${STALE_DRAFT_DAYS} jours.`,
      actionLabel: "Ouvrir",
      items: [
        ...sources.events
          .filter((e) => isStaleDraft(e, now))
          .map((e) => ({ id: e.id, title: `Événement · ${e.title}`, href: `/admin/evenements/${e.id}/edit` })),
        ...sources.productions
          .filter((p) => isStaleDraft(p, now))
          .map((p) => ({ id: p.id, title: `Production · ${p.title}`, href: `/admin/productions/${p.id}/edit` })),
        ...sources.projects
          .filter((p) => isStaleDraft(p, now))
          .map((p) => ({ id: p.id, title: `Projet · ${p.title}`, href: `/admin/projets/${p.id}/edit` })),
      ],
    },
    {
      id: "forms",
      title: "Formulaires à traiter",
      description: "Messages reçus qui n'ont pas encore été traités.",
      actionLabel: "Ouvrir",
      items: sources.forms
        .filter((f) => PENDING_FORM_STATUSES.includes(f.status))
        .map((f) => ({ id: f.id, title: f.label, href: `/admin/forms?message=${f.id}` })),
    },
    {
      id: "event-photos",
      title: "Événements passés sans photos ni compte-rendu",
      description: "La page de l'événement reste sans trace de ce qui s'y est passé.",
      actionLabel: "Ajouter les photos",
      items: sources.events
        .filter((e) => e.status === "published" && needsEventReport(e, today))
        .map((e) => ({ id: e.id, title: e.title, href: `/admin/evenements/${e.id}/edit#photos` })),
    },
  ];
  return categories.filter((category) => category.items.length > 0);
}

export function todoCount(categories: TodoCategory[]): number {
  return categories.reduce((total, category) => total + category.items.length, 0);
}
