"use client";

import { useEffect, useRef, useState, type DragEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Copy, Plus, Upload } from "lucide-react";
import type { Media } from "@/types/cms";
import { deleteMediaAction, updateMediaAltAction } from "@/app/admin/media/actions";
import { mediaClientService } from "@/services/mediaClientService";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { ImportWizard } from "@/components/media/ImportWizard";
import { matchesMediaFilter, type MediaFilter, type MediaUsage } from "@/utils/mediaUsage";

// Médiathèque : grille d'abord (recherche, filtres), ajout par bouton ou en
// glissant des fichiers sur la page, panneau de détail du média sélectionné
// (texte alternatif modifiable, « Utilisé dans », copier le lien).

const FILTERS: Array<{ id: MediaFilter; label: string }> = [
  { id: "tout", label: "Tout" },
  { id: "images", label: "Images" },
  { id: "documents", label: "Documents" },
  { id: "sans-alt", label: "Sans texte alternatif" },
];

const KIND_LABELS: Record<string, string> = {
  image: "Image",
  pdf: "PDF",
  video: "Vidéo",
  audio: "Audio",
  document: "Document",
};

function mediaMeta(item: Media): string {
  return [
    KIND_LABELS[item.type] ?? item.type,
    item.width && item.height ? `${item.width} × ${item.height}` : null,
    item.size || null,
  ]
    .filter(Boolean)
    .join(" · ");
}

const isMissingAlt = (item: Media) => item.type === "image" && !item.alt?.trim();

function Thumb({ item }: { item: Media }) {
  if (item.type === "image") {
    return <img src={item.thumbnailUrl ?? item.previewUrl ?? item.url} alt="" loading="lazy" />;
  }
  return <span className="media-kind">{(KIND_LABELS[item.type] ?? item.type).toUpperCase()}</span>;
}

interface Props {
  media: Media[];
  usage: Record<string, MediaUsage[]> | null;
  initialSelectedId: string | null;
}

export function MediaLibrary({ media, usage, initialSelectedId }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<MediaFilter>("tout");
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId ?? media[0]?.id ?? null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState<{ done: number; total: number } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialSelectedId) setSelectedId(initialSelectedId);
  }, [initialSelectedId]);

  const q = query.trim().toLowerCase();
  const filtered = media.filter(
    (item) =>
      matchesMediaFilter(item, filter) &&
      (!q ||
        item.title.toLowerCase().includes(q) ||
        item.filename.toLowerCase().includes(q) ||
        !!item.alt?.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q))),
  );
  const selected = media.find((m) => m.id === selectedId) ?? null;
  const selectedUsage = selected && usage ? (usage[selected.id] ?? []) : null;

  async function upload(files: File[]) {
    if (files.length === 0) return;
    setUploadError(null);
    setUploading({ done: 0, total: files.length });
    const failures: string[] = [];
    for (const [index, file] of files.entries()) {
      try {
        await mediaClientService.uploadFile(file, { visibility: "public" });
      } catch (error) {
        failures.push(`${file.name} : ${error instanceof Error ? error.message : "échec de l'envoi"}`);
      }
      setUploading({ done: index + 1, total: files.length });
    }
    setUploading(null);
    if (failures.length) setUploadError(failures.join(" · "));
    router.refresh();
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    void upload(Array.from(event.dataTransfer.files ?? []));
  }

  function copyLink() {
    if (!selected) return;
    navigator.clipboard
      .writeText(selected.url)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => undefined);
  }

  return (
    <div
      className={`media-page${dragging ? " is-dragging" : ""}`}
      onDragOver={(event) => {
        if (!event.dataTransfer.types.includes("Files")) return;
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={(event) => {
        if (event.currentTarget === event.target) setDragging(false);
      }}
      onDrop={onDrop}
    >
      <section className="media-main">
        <div className="media-head">
          <h1>
            Médiathèque <span>{media.length} médias</span>
          </h1>
          <button type="button" className="button primary" onClick={() => inputRef.current?.click()}>
            <Plus size={15} strokeWidth={2} aria-hidden="true" /> Ajouter des fichiers
          </button>
          <input
            ref={inputRef}
            hidden
            multiple
            type="file"
            onChange={(event) => {
              const files = Array.from(event.target.files ?? []);
              event.target.value = "";
              void upload(files);
            }}
          />
        </div>

        <div className="media-toolbar">
          <input
            type="search"
            placeholder="Rechercher par nom, tag ou texte alternatif…"
            aria-label="Rechercher dans la médiathèque"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div className="media-filter-chips" role="group" aria-label="Filtrer les médias">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`filter-chip${filter === f.id ? " active" : ""}`}
                aria-pressed={filter === f.id}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <p className="media-dropzone" aria-live="polite">
          <Upload size={15} strokeWidth={1.75} aria-hidden="true" />
          {uploading
            ? `Envoi en cours… ${uploading.done} / ${uploading.total}`
            : "Glissez vos fichiers ici pour les ajouter. Le titre et le texte alternatif se complètent ensuite, fichier par fichier."}
        </p>
        <details className="media-other-sources">
          <summary>Autres sources : lien vidéo, lien externe, Google Drive</summary>
          <ImportWizard />
        </details>
        {uploadError && (
          <p className="form-error" role="alert">
            {uploadError}
          </p>
        )}

        {filtered.length === 0 ? (
          <div className="admin-empty">
            <strong>{media.length === 0 ? "Aucun média pour l'instant" : "Aucun résultat"}</strong>
            <p>
              {media.length === 0 ? "Ajoutez vos premiers fichiers." : "Essayez un autre terme ou un autre filtre."}
            </p>
          </div>
        ) : (
          <ul className="media-tiles">
            {filtered.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={`media-tile${item.id === selectedId ? " is-selected" : ""}`}
                  aria-pressed={item.id === selectedId}
                  onClick={() => setSelectedId(item.id)}
                >
                  <span className="media-tile-thumb">
                    <Thumb item={item} />
                    {isMissingAlt(item) && <span className="media-tile-badge">Sans texte alternatif</span>}
                  </span>
                  <span className="media-tile-name">{item.filename || item.title}</span>
                  <span className="media-tile-meta">{mediaMeta(item)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <aside className="media-detail" aria-label="Média sélectionné">
        {selected ? (
          <>
            <p className="media-detail-kicker">Média sélectionné</p>
            <div className="media-detail-preview">
              {selected.type === "image" ? (
                <img src={selected.previewUrl ?? selected.url} alt={selected.alt ?? ""} />
              ) : (
                <span className="media-kind">{(KIND_LABELS[selected.type] ?? selected.type).toUpperCase()}</span>
              )}
            </div>
            <h2>{selected.filename || selected.title}</h2>
            <p className="media-detail-meta">{mediaMeta(selected)}</p>

            {selected.type === "image" && (
              <form action={updateMediaAltAction} className="media-detail-alt" key={selected.id}>
                <input type="hidden" name="id" value={selected.id} />
                <label className="field-label" htmlFor="media-alt">
                  Texte alternatif
                </label>
                <p className="field-hint" id="media-alt-hint">
                  Décrit l&apos;image pour les lecteurs d&apos;écran et Google.
                </p>
                <textarea
                  id="media-alt"
                  name="alt"
                  rows={3}
                  defaultValue={selected.alt ?? ""}
                  aria-describedby="media-alt-hint"
                />
                <button type="submit" className="button primary">
                  Enregistrer
                </button>
              </form>
            )}

            <div className="media-detail-usage">
              <p className="field-label">Utilisé dans</p>
              {selectedUsage === null ? (
                <p className="field-hint">Information indisponible pour le moment.</p>
              ) : selectedUsage.length === 0 ? (
                <p className="field-hint">Aucun contenu ne l&apos;utilise (hors images placées dans les textes).</p>
              ) : (
                <ul>
                  {selectedUsage.map((use) => (
                    <li key={`${use.href}-${use.label}`}>
                      <Link href={use.href}>{use.label}</Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="media-detail-actions">
              <button type="button" className="button" onClick={copyLink}>
                {copied ? (
                  <Check size={14} strokeWidth={2} aria-hidden="true" />
                ) : (
                  <Copy size={14} strokeWidth={1.75} aria-hidden="true" />
                )}
                {copied ? "Lien copié" : "Copier le lien"}
              </button>
              <Link href={`/admin/media/${selected.id}/edit`} className="button">
                Tous les détails
              </Link>
              <form action={deleteMediaAction}>
                <input type="hidden" name="id" value={selected.id} />
                <ConfirmDeleteButton />
              </form>
            </div>
          </>
        ) : (
          <p className="field-hint">Sélectionnez un média pour voir son détail.</p>
        )}
      </aside>
    </div>
  );
}
