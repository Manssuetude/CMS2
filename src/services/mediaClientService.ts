import { createClient } from "@supabase/supabase-js";
import type { Media } from "@/types/cms";

// Client minimal pour l'envoi direct vers Supabase Storage (clé publique
// anon, sans session) — voir uploadFile ci-dessous pour le pourquoi.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
);
const STORAGE_BUCKET = "manssuetude-media";

type UploadMetadata = {
  title?: string;
  alt?: string;
  caption?: string;
  description?: string;
  tags?: string;
  visibility?: string;
};

export const mediaClientService = {
  async uploadFile(file: File, metadata?: UploadMetadata): Promise<Media> {
    // 1. Ticket d'upload signé — requête JSON minuscule (pas de binaire), ne
    //    risque donc jamais de dépasser la limite de taille de requête des
    //    fonctions Vercel, contrairement à un envoi direct du fichier à notre
    //    propre route (ce qui faisait échouer tout fichier un peu lourd avec
    //    une erreur 413, avant même d'atteindre notre code).
    const ticketRes = await fetch("/api/media/upload-ticket", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ filename: file.name }),
    });
    if (!ticketRes.ok) {
      const body = await ticketRes.json().catch(() => null);
      throw new Error((body as { error?: string })?.error || "Échec de la préparation de l'import.");
    }
    const ticket = (await ticketRes.json()) as { path: string; token: string; url: string };

    // 2. Envoi direct du fichier vers Supabase Storage, depuis le navigateur —
    //    contourne entièrement notre fonction serveur pour le binaire.
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .uploadToSignedUrl(ticket.path, ticket.token, file);
    if (uploadError) throw new Error(uploadError.message || "Échec de l'envoi du fichier.");

    // 3. Enregistre les métadonnées — le fichier est déjà dans le stockage,
    //    cette requête ne transporte plus aucun binaire.
    const formData = new FormData();
    formData.set("path", ticket.path);
    formData.set("url", ticket.url);
    formData.set("filename", file.name);
    formData.set("size", String(file.size));
    formData.set("mimeType", file.type);
    formData.set("title", metadata?.title || file.name);
    if (metadata?.alt) formData.set("alt", metadata.alt);
    if (metadata?.caption) formData.set("caption", metadata.caption);
    if (metadata?.description) formData.set("description", metadata.description);
    if (metadata?.tags) formData.set("tags", metadata.tags);
    if (metadata?.visibility) formData.set("visibility", metadata.visibility);

    const response = await fetch("/api/media", { method: "POST", body: formData });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new Error((body as { error?: string })?.error || "Échec de l'enregistrement du fichier.");
    }
    return response.json();
  },
};
