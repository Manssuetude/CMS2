import { getSupabaseAdmin } from "@/lib/db";
import { normalizeUrl } from "@/repositories/mediaRepository";
import type { ContentStatus, Dossier, DossierItem, DossierItemEntityType, DossierMode } from "@/types/cms";
import { asNullableString, asString, type DataRow } from "@/utils/row";

function mapDossier(row: DataRow): Dossier {
  const imageResource = (row.image_resource as { url?: string } | null) ?? null;
  return {
    id: asString(row.id),
    slug: asString(row.slug),
    title: asString(row.title),
    description: asNullableString(row.description),
    mode: asString(row.mode, "libre") as DossierMode,
    imageId: asNullableString(row.image_id),
    imageUrl: normalizeUrl(imageResource?.url),
    status: asString(row.status, "draft") as ContentStatus,
    createdAt: asString(row.created_at),
    updatedAt: asString(row.updated_at),
  };
}

function mapDossierItem(row: DataRow): DossierItem {
  return {
    id: asString(row.id),
    dossierId: asString(row.dossier_id),
    position: typeof row.position === "number" ? row.position : Number(row.position ?? 0),
    entityType: asString(row.entity_type) as DossierItemEntityType,
    entityId: asString(row.entity_id),
  };
}

export const dossierRepository = {
  async listDossiers(includeDrafts = false): Promise<Dossier[]> {
    const db = getSupabaseAdmin();
    let query = db
      .from("dossiers")
      .select("*, image_resource:resources!image_id(url)")
      .order("created_at", { ascending: false });
    if (!includeDrafts) query = query.eq("status", "published");
    const { data, error } = await query;
    if (error) throw error;
    return data.map(mapDossier);
  },

  async getDossier(slug: string): Promise<Dossier | null> {
    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from("dossiers")
      .select("*, image_resource:resources!image_id(url)")
      .eq("slug", slug)
      .single();
    if (error || !data) return null;
    return mapDossier(data as DataRow);
  },

  async getDossierById(id: string): Promise<Dossier | null> {
    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from("dossiers")
      .select("*, image_resource:resources!image_id(url)")
      .eq("id", id)
      .single();
    if (error || !data) return null;
    return mapDossier(data as DataRow);
  },

  async createDossier(input: Record<string, unknown>): Promise<Dossier> {
    const db = getSupabaseAdmin();
    const { data, error } = await db.from("dossiers").insert(input).select().single();
    if (error) throw error;
    return mapDossier(data as DataRow);
  },

  async updateDossier(id: string, input: Record<string, unknown>): Promise<Dossier> {
    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from("dossiers")
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return mapDossier(data as DataRow);
  },

  async deleteDossier(id: string): Promise<void> {
    const db = getSupabaseAdmin();
    const { error } = await db.from("dossiers").delete().eq("id", id);
    if (error) throw error;
  },

  async getDossierItems(dossierId: string): Promise<DossierItem[]> {
    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from("dossier_items")
      .select("*")
      .eq("dossier_id", dossierId)
      .order("position", { ascending: true });
    if (error) throw error;
    return data.map(mapDossierItem);
  },

  // Remplace l'ensemble des contenus d'un dossier par la liste ordonnée fournie
  // (position = index dans le tableau) — même pattern que setProductionAuthors.
  async setDossierItems(
    dossierId: string,
    items: Array<{ entityType: DossierItemEntityType; entityId: string }>,
  ): Promise<void> {
    const db = getSupabaseAdmin();
    const { error: deleteError } = await db.from("dossier_items").delete().eq("dossier_id", dossierId);
    if (deleteError) throw deleteError;
    if (items.length === 0) return;
    const rows = items.map((item, index) => ({
      dossier_id: dossierId,
      entity_type: item.entityType,
      entity_id: item.entityId,
      position: index,
    }));
    const { error: insertError } = await db.from("dossier_items").insert(rows);
    if (insertError) throw insertError;
  },
};
