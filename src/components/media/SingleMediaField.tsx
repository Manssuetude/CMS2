"use client";

import { useState } from "react";
import type { Media } from "@/types/cms";
import { MediaPickerModal } from "./MediaPickerModal";

interface Props {
  name: string;
  initialMedia: Media[];
  initialSelectedId?: string | null;
  buttonLabel?: string;
}

// Remplace l'ancien <select> (liste de titres en texte) par un aperçu visuel
// + une fenêtre de sélection à vignettes — voir MediaPickerModal.
export function SingleMediaField({ name, initialMedia, initialSelectedId, buttonLabel = "Choisir une image" }: Props) {
  const [media, setMedia] = useState(initialMedia);
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId ?? null);
  const [open, setOpen] = useState(false);

  const selected = selectedId ? media.find((m) => m.id === selectedId) : undefined;

  return (
    <div className="single-media-field">
      <input type="hidden" name={name} value={selectedId ?? ""} />
      {selected ? (
        <div className="single-media-preview">
          <span className="single-media-thumb">
            {selected.type === "image" ? (
              <img src={selected.thumbnailUrl ?? selected.previewUrl ?? selected.url} alt="" />
            ) : (
              <span className="media-kind">{selected.type.toUpperCase()}</span>
            )}
          </span>
          <div className="single-media-info">
            <strong>{selected.title}</strong>
            <div className="row-actions">
              <button type="button" className="btn-sm" onClick={() => setOpen(true)}>
                Changer
              </button>
              <button type="button" className="btn-sm" onClick={() => setSelectedId(null)}>
                Retirer
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button type="button" className="button" onClick={() => setOpen(true)}>
          {buttonLabel}
        </button>
      )}
      <MediaPickerModal
        open={open}
        onClose={() => setOpen(false)}
        media={media}
        mode="single"
        selectedIds={selectedId ? [selectedId] : []}
        onConfirm={(ids) => setSelectedId(ids[0] ?? null)}
        onUploaded={(item) => setMedia((prev) => [item, ...prev])}
      />
    </div>
  );
}
