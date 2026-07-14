import { getSupabaseAdmin } from "@/lib/db";
import { getSession } from "@/lib/auth";

// Journalise une action dans `audit_logs`. Ne doit JAMAIS faire échouer l'action appelante.
export async function logAction(
  action: string,
  opts: { entityType?: string; entityId?: string; summary?: string } = {},
): Promise<void> {
  try {
    const session = await getSession();
    const db = getSupabaseAdmin();
    await db.from("audit_logs").insert({
      actor_id: session?.userId ?? null,
      actor_email: session?.email ?? null,
      actor_role: session?.roleKey ?? null,
      action,
      entity_type: opts.entityType ?? null,
      entity_id: opts.entityId ?? null,
      summary: opts.summary ?? null,
    });
  } catch {
    // silencieux : la journalisation est best-effort
  }
}
