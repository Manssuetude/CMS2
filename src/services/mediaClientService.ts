import type { Media } from "@/types/cms";

export const mediaClientService = {
  async uploadFile(file: File, metadata?: { title?: string; alt?: string }): Promise<Media> {
    const formData = new FormData();
    formData.set("file", file);
    formData.set("title", metadata?.title || file.name);
    if (metadata?.alt) formData.set("alt", metadata.alt);

    const response = await fetch("/api/media", { method: "POST", body: formData });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new Error(body?.error || "Échec de l'envoi du fichier.");
    }
    return response.json();
  },
};
