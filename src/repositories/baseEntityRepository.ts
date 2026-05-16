import { getSupabaseAdmin } from "@/lib/db";
import type { EntityRelation, EntityType, RelationKind } from "@/types/cms";
import { asRecord, asString } from "@/utils/row";

export async function listRows(table: string, includeDrafts = false) {
  const db = getSupabaseAdmin();
  let query = db.from(table).select("*").order("updated_at", { ascending: false });
  if (!includeDrafts) query = query.eq("status", "published");
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function upsertRow(table: string, payload: Record<string, unknown>, onConflict = "id") {
  const db = getSupabaseAdmin();
  const { data, error } = await db.from(table).upsert(payload, { onConflict }).select().single();
  if (error) throw error;
  return data;
}

export async function listRelations(entityType: EntityType, entityId: string): Promise<EntityRelation[]> {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("entity_relations")
    .select("*")
    .or(`and(from_type.eq.${entityType},from_id.eq.${entityId}),and(to_type.eq.${entityType},to_id.eq.${entityId})`)
    .order("weight", { ascending: false });
  if (error) throw error;
  return (data || []).map(
    (row): EntityRelation => ({
      id: asString(row.id),
      fromType: asString(row.from_type) as EntityType,
      fromId: asString(row.from_id),
      toType: asString(row.to_type) as EntityType,
      toId: asString(row.to_id),
      kind: asString(row.kind) as RelationKind,
      weight: typeof row.weight === "number" ? row.weight : 50,
      metadata: asRecord(row.metadata),
    }),
  );
}

export async function relateEntities(input: {
  fromType: EntityType;
  fromId: string;
  toType: EntityType;
  toId: string;
  kind?: RelationKind;
  weight?: number;
  metadata?: Record<string, unknown>;
}) {
  return upsertRow(
    "entity_relations",
    {
      from_type: input.fromType,
      from_id: input.fromId,
      to_type: input.toType,
      to_id: input.toId,
      kind: input.kind || "related",
      weight: input.weight || 50,
      metadata: input.metadata || {},
    },
    "from_type,from_id,to_type,to_id,kind",
  );
}
