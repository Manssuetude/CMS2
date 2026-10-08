"use client";

import { useState } from "react";
import { GripVertical, X } from "lucide-react";
import type { Media } from "@/types/cms";
import { MediaPickerModal } from "./MediaPickerModal";

interface Props {
  name: string;
  initialMedia: Media[];
  initialSelectedIds?: string[];
  buttonLabel?: string;
}

// Remplace l'ancienne liste de cases à cocher (titres en texte, ordre figé)
// par des vignettes réordonnables au glisser-déposer — voir MediaPickerModal
// pour la sélection elle-même.
export function SortableMediaGallery({
  name,
  initialMedia,
  initialSelectedIds = [],
  buttonLabel = "Ajouter des images",
}: Props) {
  const [media, setMedia] = useState(initialMedia);
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);
  const [open, setOpen] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const selectedItems = selectedIds.map((id) => media.find((m) => m.id === id)).filter((m): m is Media => m != null);

  function remove(id: string) {
    setSelectedIds((prev) => prev.filter((x) => x !== id));
  }

  function handleDrop(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex) {
      setDragIndex(null);
      return;
    }
    setSelectedIds((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
    setDragIndex(null);
  }

  return (
    <div className="sortable-media-gallery">
      <input type="hidden" name={name} value={selectedIds.join(",")} />
      {selectedItems.length > 0 && (
        <div className="sortable-media-list">
          {selectedItems.map((item, index) => (
            <div
              key={item.id}
              className={`sortable-media-item${dragIndex === index ? " is-dragging" : ""}`}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(index)}
              onDragEnd={() => setDragIndex(null)}
            >
              <span className="sortable-media-handle" aria-hidden="true">
                <GripVertical size={14} strokeWidth={2} />
              </span>
              <span className="sortable-media-thumb">
                {item.type === "image" ? (
                  <img src={item.thumbnailUrl ?? item.previewUrl ?? item.url} alt="" />
                ) : (
                  <span className="media-kind">{item.type.toUpperCase()}</span>
                )}
              </span>
              <span className="sortable-media-title">{item.title}</span>
              <button
                type="button"
                className="sortable-media-remove"
                onClick={() => remove(item.id)}
                aria-label={`Retirer ${item.title}`}
              >
                <X size={14} strokeWidth={2} />
              </button>
            </div>
          ))}
        </div>
      )}
      <button type="button" className="button" onClick={() => setOpen(true)}>
        {buttonLabel}
      </button>
      <MediaPickerModal
        open={open}
        onClose={() => setOpen(false)}
        media={media}
        mode="multi"
        selectedIds={selectedIds}
        onConfirm={(ids) => setSelectedIds(ids)}
        onUploaded={(item) => setMedia((prev) => [item, ...prev])}
      />
    </div>
  );
}
