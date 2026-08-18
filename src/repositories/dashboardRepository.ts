import { getSupabaseAdmin } from "@/lib/db";

export const dashboardRepository = {
  async getMetrics() {
    const db = getSupabaseAdmin();
    const [acts, prods, projs, forms, authorsCount] = await Promise.all([
      db.from("activities").select("id, title, status, date, updated_at").order("updated_at", { ascending: false }),
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
      activities: (acts.data ?? []) as Array<{
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
