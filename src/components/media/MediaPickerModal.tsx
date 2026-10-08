"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Upload, Check } from "lucide-react";
import type { Media } from "@/types/cms";
import { mediaClientService } from "@/services/mediaClientService";

interface Props {
  open: boolean;
  onClose: () => void;
  media: Media[];
  mode: "single" | "multi";
  selectedIds: string[];
  onConfirm: (ids: string[]) => void;
  onUploaded?: (item: Media) => void;
}

// Fenêtre de sélection visuelle (grille de vignettes + recherche + import à la
// volée) partagée par tous les champs image/galerie de l'admin, à la place
// des anciennes listes déroulantes/cases à cocher qui n'affichaient que le
// titre du fichier — voir SingleMediaField et SortableMediaGallery.
export function MediaPickerModal({ open, onClose, media, mode, selectedIds, onConfirm, onUploaded }: Props) {
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState<string[]>(selectedIds);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Resynchronise la sélection provisoire (mode multi) à chaque ouverture —
  // le composant reste monté entre deux ouvertures, son state ne se
  // réinitialise donc pas tout seul.
  useEffect(() => {
    if (open) {
      setPending(selectedIds);
      setQuery("");
      setShowUpload(false);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return media;
    return media.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.filename.toLowerCase().includes(q) ||
        m.alt?.toLowerCase().includes(q) ||
        m.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [media, query]);

  if (!open) return null;

  function toggle(id: string) {
    if (mode === "single") {
      onConfirm([id]);
      onClose();
      return;
    }
    setPending((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const file = (form.elements.namedItem("file") as HTMLInputElement | null)?.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const item = await mediaClientService.uploadFile(file, { title: uploadTitle || undefined });
      onUploaded?.(item);
      if (mode === "single") {
        onConfirm([item.id]);
        onClose();
      } else {
        setPending((prev) => [...prev, item.id]);
        setShowUpload(false);
        setUploadTitle("");
        form.reset();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'import.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className="modal media-picker-modal"
        role="dialog"
        aria-modal="true"
        aria-label={mode === "multi" ? "Choisir des images" : "Choisir une image"}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="media-picker-header">
          <h2>{mode === "multi" ? "Choisir des images" : "Choisir une image"}</h2>
          <button type="button" className="btn-sm" onClick={onClose}>
            Fermer
          </button>
        </div>

        <div className="media-picker-toolbar">
          <div className="media-picker-search">
            <Search size={15} strokeWidth={2} />
            <input
              placeholder="Rechercher par titre, tag, texte alternatif..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>
          <button type="button" className="btn-sm" onClick={() => setShowUpload((v) => !v)}>
            <Upload size={13} strokeWidth={2} />
            Importer
          </button>
        </div>

        {showUpload && (
          <form className="media-picker-upload" onSubmit={handleUpload}>
            <input name="file" type="file" accept="image/*" required />
            <input
              placeholder="Titre (facultatif, sinon le nom du fichier)"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
            />
            <button className="button primary" type="submit" disabled={uploading}>
              {uploading ? "Import..." : "Importer et sélectionner"}
            </button>
            {error && <p className="form-error">{error}</p>}
          </form>
        )}

        {filtered.length === 0 ? (
          <p className="media-picker-empty">Aucune image trouvée.</p>
        ) : (
          <div className="media-picker-grid">
            {filtered.map((item) => {
              const isSelected = mode === "single" ? selectedIds.includes(item.id) : pending.includes(item.id);
              return (
                <button
                  type="button"
                  key={item.id}
                  className={`media-picker-item${isSelected ? " is-selected" : ""}`}
                  onClick={() => toggle(item.id)}
                  title={item.title}
                >
                  <span className="media-picker-thumb">
                    {item.type === "image" ? (
                      <img src={item.thumbnailUrl ?? item.previewUrl ?? item.url} alt="" loading="lazy" />
                    ) : (
                      <span className="media-kind">{item.type.toUpperCase()}</span>
                    )}
                    {isSelected && (
                      <span className="media-picker-check">
                        <Check size={14} strokeWidth={3} />
                      </span>
                    )}
                  </span>
                  <span className="media-picker-label">{item.title}</span>
                </button>
              );
            })}
          </div>
        )}

        {mode === "multi" && (
          <div className="media-picker-footer">
            <span>
              {pending.length} sélectionnée{pending.length > 1 ? "s" : ""}
            </span>
            <button
              type="button"
              className="button primary"
              onClick={() => {
                onConfirm(pending);
                onClose();
              }}
            >
              Ajouter
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
