import { getSupabaseAdmin } from "@/lib/db";

export type AdminNavCounts = {
  /** Formulaires reçus non traités (statut « reçu » ou « en cours »). */
  pendingForms: number;
  journalEntries: number;
  dossiers: number;
};

export const dashboardRepository = {
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

  async getMetrics() {
    const db = getSupabaseAdmin();
    const [acts, prods, projs, forms, authorsCount] = await Promise.all([
      db.from("events").select("id, title, status, date, updated_at").order("updated_at", { ascending: false }),
      db.from("productions").select("id, title, status, updated_at").order("updated_at", { ascending: false }),
      db.from("projects").select("id, title, status, updated_at").order("updated_at", { ascending: false }),
      db
        .from("form_submissions")
        .select("id, form_type, status, received_at, data")
        .order("received_at", { ascending: false }),
      db.from("authors").select("id", { count: "exact", head: true }),
    ]);
    return {
      authorsCount: authorsCount.count ?? 0,
      events: (acts.data ?? []) as Array<{
        id: string;
        title: string;
        status: string;
        date: string | null;
        updated_at: string;
      }>,
      productions: (prods.data ?? []) as Array<{
        id: string;
        title: string;
        status: string;
        updated_at: string;
      }>,
      projects: (projs.data ?? []) as Array<{
        id: string;
        title: string;
        status: string;
        updated_at: string;
      }>,
      forms: (forms.data ?? []) as Array<{
        id: string;
        form_type: string;
        status: string;
        received_at: string;
        data: Record<string, unknown>;
      }>,
    };
  },
};
