import { getSupabaseAdmin } from "@/lib/db";
import { asNullableString, asString, type DataRow } from "@/utils/row";

export type AuditLog = {
  id: string;
  actorEmail: string | null;
  actorRole: string | null;
  action: string;
  entityType: string | null;
  entityId: string | null;
  summary: string | null;
  createdAt: string;
};

function mapLog(row: DataRow): AuditLog {
  return {
    id: asString(row.id),
    actorEmail: asNullableString(row.actor_email),
    actorRole: asNullableString(row.actor_role),
    action: asString(row.action),
    entityType: asNullableString(row.entity_type),
    entityId: asNullableString(row.entity_id),
    summary: asNullableString(row.summary),
    createdAt: asString(row.created_at),
  };
}

export const auditRepository = {
  async list(opts: { action?: string; limit?: number } = {}): Promise<AuditLog[]> {
    const db = getSupabaseAdmin();
    let query = db
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(opts.limit ?? 300);
    if (opts.action) query = query.eq("action", opts.action);
    const { data, error } = await query;
    if (error) throw error;
    return (data as DataRow[]).map(mapLog);
  },

  async distinctActions(): Promise<string[]> {
    const db = getSupabaseAdmin();
    const { data, error } = await db.from("audit_logs").select("action").limit(1000);
    if (error) throw error;
    return [...new Set((data as DataRow[]).map((r) => asString(r.action)))].sort();
  },
};
