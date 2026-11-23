import { getSupabaseAdmin } from "@/lib/db";

export type AdminNavCounts = {
  /** Formulaires reçus non traités (statut « reçu » ou « en cours »). */
  pendingForms: number;
  journalEntries: number;
  dossiers: number;
};

type Row = Record<string, unknown>;
const str = (value: unknown) => (typeof value === "string" ? value : "");
const strList = (value: unknown) =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];

export type DashboardSources = {
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
  forms: Array<{ id: string; formType: string; status: string; data: Record<string, unknown> }>;
  mediaCount: number;
};

export const dashboardRepository = {
  /**
   * Données du tableau de bord (« À faire », chiffres). Colonnes légères
   * seulement : le texte des productions n'est pas rapatrié, on lit juste
   * quelles productions en ont un.
   */
  async getDashboardSources(): Promise<DashboardSources> {
    const db = getSupabaseAdmin();
    const [prods, withBody, events, projects, forms, media] = await Promise.all([
      db.from("productions").select("id, title, status, updated_at, file_id"),
      db.from("productions").select("id").not("body", "is", null).neq("body", ""),
      db.from("events").select("id, title, status, updated_at, date, gallery, documents"),
      db.from("projects").select("id, title, status, updated_at"),
      db.from("form_submissions").select("id, form_type, status, data").order("received_at", { ascending: false }),
      db.from("resources").select("id", { count: "exact", head: true }),
    ]);
    for (const result of [prods, withBody, events, projects, forms]) if (result.error) throw result.error;
    const bodyIds = new Set((withBody.data ?? []).map((r: Row) => str(r.id)));
    return {
      productions: (prods.data ?? []).map((r: Row) => ({
        id: str(r.id),
        title: str(r.title),
        status: str(r.status),
        updatedAt: str(r.updated_at),
        hasBody: bodyIds.has(str(r.id)),
        hasPdf: !!r.file_id,
      })),
      events: (events.data ?? []).map((r: Row) => ({
        id: str(r.id),
        title: str(r.title),
        status: str(r.status),
        updatedAt: str(r.updated_at),
        date: str(r.date) || null,
        gallery: strList(r.gallery),
        documents: strList(r.documents),
      })),
      projects: (projects.data ?? []).map((r: Row) => ({
        id: str(r.id),
        title: str(r.title),
        status: str(r.status),
        updatedAt: str(r.updated_at),
      })),
      forms: (forms.data ?? []).map((r: Row) => ({
        id: str(r.id),
        formType: str(r.form_type),
        status: str(r.status),
        data: r.data && typeof r.data === "object" ? (r.data as Record<string, unknown>) : {},
      })),
      mediaCount: media.count ?? 0,
    };
  },

  // Compteurs du menu de l'admin : requêtes « head » (aucune ligne rapatriée).
  async getNavCounts(): Promise<AdminNavCounts> {
    const db = getSupabaseAdmin();
    const [forms, journal, dossiers] = await Promise.all([
      db.from("form_submissions").select("id", { count: "exact", head: true }).in("status", ["reçu", "en cours"]),
      db.from("journal_entries").select("id", { count: "exact", head: true }),
      db.from("dossiers").select("id", { count: "exact", head: true }),
    ]);
    return {
      pendingForms: forms.count ?? 0,
      journalEntries: journal.count ?? 0,
      dossiers: dossiers.count ?? 0,
    };
  },
};
