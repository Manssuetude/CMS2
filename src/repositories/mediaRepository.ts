import { getSupabaseAdmin } from "@/lib/db";
import { inferMediaType, uploadToStorage } from "@/lib/media";
import type { Media, MediaSource, MediaType, Visibility } from "@/types/cms";
import { asNullableString, asString, asStringArray, type DataRow } from "@/utils/row";
import { parseTags } from "@/utils/tags";

export function normalizeUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("http") || url.startsWith("/")) return url;
  return `/${url}`;
}

function mapMedia(row: DataRow): Media {
  return {
    id: asString(row.id),
    title: asString(row.title),
    filename: asString(row.filename),
    source: asString(row.source, "upload") as MediaSource,
    type: asString(row.type, "document") as MediaType,
    mimeType: asString(row.mime_type, "application/octet-stream"),
    url: asString(row.url),
    previewUrl: asNullableString(row.preview_url),
    thumbnailUrl: asNullableString(row.thumbnail_url),
    size: asNullableString(row.size),
    alt: asNullableString(row.alt),
    caption: asNullableString(row.caption),
    description: asNullableString(row.description),
    tags: asStringArray(row.tags),
    visibility: asString(row.visibility, "draft") as Visibility,
    uploadedBy: asNullableString(row.uploaded_by),
    createdAt: asString(row.created_at),
    updatedAt: asString(row.updated_at),
  };
}

export const mediaRepository = {
  async list() {
    const db = getSupabaseAdmin();
    const { data, error } = await db.from("resources").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data.map(mapMedia);
  },

  async create(payload: Record<string, unknown>) {
    const db = getSupabaseAdmin();
    const { data, error } = await db.from("resources").insert(payload).select().single();
    if (error) throw error;
    return mapMedia(data);
  },

  async upload(file: File, metadata: Record<string, string>) {
    const stored = await uploadToStorage(file);
    return this.create({
      title: metadata.title || file.name,
      filename: file.name,
      source: "upload",
      type: inferMediaType(file.name),
      mime_type: file.type || "application/octet-stream",
      url: stored.url,
      preview_url: stored.url,
      thumbnail_url: inferMediaType(file.name) === "image" ? stored.url : null,
      size: `${Math.max(1, Math.round(file.size / 1024))} Ko`,
      alt: metadata.alt || metadata.title || file.name,
      caption: metadata.caption || null,
      description: metadata.description || null,
      tags: parseTags(metadata.tags),
      visibility: metadata.visibility || "draft",
    });
  },

  async remove(id: string) {
    const db = getSupabaseAdmin();
    const { error } = await db.from("resources").delete().eq("id", id);
    if (error) throw error;
  },

  async rename(id: string, title: string) {
    const db = getSupabaseAdmin();
    const { data, error } = await db.from("resources").update({ title }).eq("id", id).select().single();
    if (error) throw error;
    return mapMedia(data);
  },

  // Résout l'URL (absolue/normalisée) d'une ressource média par son id. Utilisé pour
  // les images Open Graph des fiches (thème, production, activité). Renvoie null si absente.
  async getResourceUrl(id: string | null | undefined): Promise<string | null> {
    if (!id) return null;
    const db = getSupabaseAdmin();
    const { data, error } = await db.from("resources").select("url").eq("id", id).single();
    if (error || !data) return null;
    return normalizeUrl((data as { url?: string }).url);
  },
};
