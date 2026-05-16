"use client";

import { useState } from "react";
import type { Media } from "@/types/cms";
import { mediaClientService } from "@/services/mediaClientService";

export function MediaField({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: Media | null;
  onChange?: (media: Media | null) => void;
}) {
  const [preview, setPreview] = useState(value || null);

  async function upload(file: File) {
    const media = await mediaClientService.uploadFile(file);
    setPreview(media);
    onChange?.(media);
  }

  return (
    <div className="media-field">
      <strong>{label}</strong>
      <div className="media-preview">
        {preview?.type === "image" ? (
          <img src={preview.url} alt={preview.alt || preview.title} />
        ) : (
          <span>{preview?.title || "Aucun média sélectionné"}</span>
        )}
      </div>
      <div className="media-actions">
        <label className="button">
          Importer depuis ordinateur
          <input hidden type="file" onChange={(event) => event.target.files?.[0] && upload(event.target.files[0])} />
        </label>
        <button className="button" type="button">
          Choisir depuis la médiathèque
        </button>
        <button className="button" type="button">
          Choisir depuis Google Drive
        </button>
        <button className="button" type="button" onClick={() => setPreview(null)}>
          Supprimer
        </button>
      </div>
      <label>
        Alt text
        <input defaultValue={preview?.alt || ""} />
      </label>
      <label>
        Légende
        <input defaultValue={preview?.caption || ""} />
      </label>
    </div>
  );
}
