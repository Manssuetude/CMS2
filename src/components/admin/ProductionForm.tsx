"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { ExternalLink, FileText, PenLine, X } from "lucide-react";
import type { Author, Media, Production, SubTheme, Theme } from "@/types/cms";
import { mediaClientService } from "@/services/mediaClientService";
import { CheckboxMultiSelect } from "@/components/admin/CheckboxMultiSelect";

type ActionFn = (prevState: string | null, formData: FormData) => Promise<string | null>;

const TYPES = ["Article", "Note & Synthese", "Etude & Rapport", "Video", "Podcast", "Infographie"];

function toSlug(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface Props {
  initialData?: Production;
  action: ActionFn;
  themes?: Theme[];
  subThemes?: SubTheme[];
  initialSubThemeIds?: string[];
  authors?: Author[];
  initialAuthorIds?: string[];
  mediaItems?: Media[];
  initialResourceIds?: string[];
}

export function ProductionForm({
  initialData,
  action,
  themes = [],
  subThemes = [],
  initialSubThemeIds = [],
  authors = [],
  initialAuthorIds = [],
  mediaItems = [],
  initialResourceIds = [],
}: Props) {
  const isEdit = !!initialData;
  const [error, formAction, isPending] = useActionState(action, null);
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [type, setType] = useState(initialData?.type ?? "");
  const [selectedSubThemes, setSelectedSubThemes] = useState<string[]>(initialSubThemeIds);
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>(initialAuthorIds);
  const [selectedResources, setSelectedResources] = useState<string[]>(initialResourceIds);
  const [fileId, setFileId] = useState(initialData?.fileId ?? "");
  const [fileName, setFileName] = useState<string | null>(initialData?.fileId ? "PDF déjà attaché" : null);
  const [uploading, setUploading] = useState(false);

  async function handlePdfUpload(file: File) {
    setUploading(true);
    try {
      const media = await mediaClientService.uploadFile(file);
      setFileId(media.id);
      setFileName(media.title);
    } finally {
      setUploading(false);
    }
  }

  const themeTitleById = new Map(themes.map((t) => [t.id, t.title]));
  const subThemesByTheme = new Map<string, SubTheme[]>();
  for (const st of subThemes) {
    const list = subThemesByTheme.get(st.themeId) ?? [];
    list.push(st);
    subThemesByTheme.set(st.themeId, list);
  }

  const publicHref = isEdit ? `/productions/${initialData.slug}` : null;

  return (
    <form action={formAction}>
      {isEdit && <input type="hidden" name="id" value={initialData.id} />}
      {!isEdit && <input type="hidden" name="slug" value={slug} />}
      <input type="hidden" name="subThemeIds" value={selectedSubThemes.join(",")} />
      <input type="hidden" name="authorIds" value={selectedAuthors.join(",")} />
      <input type="hidden" name="resourceIds" value={selectedResources.join(",")} />
      <input type="hidden" name="fileId" value={fileId} />

      {error && <p className="form-error">{error}</p>}

      <div className="content-form">
        {/* Informations */}
        <div className="form-section">
          <p className="form-section-title">Informations générales</p>

          <div className="form-field">
            <label className="field-label">Titre *</label>
            <input
              type="text"
              name="title"
              defaultValue={initialData?.title}
              required
              placeholder="Ex. : Industrialisation en CEMAC : où en sommes-nous ?"
              onChange={(e) => {
                if (!isEdit) setSlug(toSlug(e.target.value));
              }}
            />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="field-label">Type *</label>
              <select name="type" value={type} onChange={(e) => setType(e.target.value)} required>
                <option value="" disabled>
                  Choisir un type...
                </option>
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label className="field-label">Auteur</label>
              <input
                type="text"
                name="author"
                defaultValue={initialData?.author ?? ""}
                placeholder="Nom de l'auteur ou de l'équipe"
              />
            </div>
          </div>

          {(type === "Video" || type === "Podcast") && (
            <div className="form-field">
              <label className="field-label">
                {type === "Video" ? "URL vidéo (YouTube ou Vimeo)" : "URL audio (fichier .mp3 ou lien YouTube/Vimeo)"}
              </label>
              <input
                type="url"
                name="videoUrl"
                defaultValue={initialData?.videoUrl ?? ""}
                placeholder={type === "Video" ? "https://www.youtube.com/watch?v=..." : "https://.../episode.mp3"}
              />
            </div>
          )}

          <div className="form-row">
            <div className="form-field">
              <label className="field-label">Date de publication</label>
              <input type="date" name="date" defaultValue={initialData?.date?.slice(0, 10) ?? ""} />
            </div>
            <div className="form-field">
              <label className="field-label">
                {type === "Video" || type === "Podcast" ? "Durée" : "Temps de lecture (optionnel)"}
              </label>
              <input
                type="text"
                name="readingTime"
                defaultValue={initialData?.readingTime ?? ""}
                placeholder={
                  type === "Video" || type === "Podcast" ? "Ex. : 12 min" : "Calculé automatiquement si laissé vide"
                }
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="field-label">Nombre de pages</label>
              <input type="text" name="pages" defaultValue={initialData?.pages ?? ""} placeholder="Ex. : 42" />
            </div>
            <div className="form-field" style={{ justifyContent: "flex-end" }}>
              <div className="form-checkbox">
                <input type="checkbox" id="featured" name="featured" defaultChecked={initialData?.featured} />
                <label htmlFor="featured">Mettre en vedette</label>
              </div>
            </div>
          </div>
        </div>

        {/* Description courte */}
        <div className="form-section">
          <p className="form-section-title">Résumé court</p>
          <div className="form-field">
            <label className="field-label">Description</label>
            <textarea
              name="description"
              defaultValue={initialData?.description ?? ""}
              rows={3}
              placeholder="Description courte pour les listes et les metas SEO..."
            />
          </div>
        </div>

        {/* Corps du document */}
        <div className="form-section">
          <p className="form-section-title">Contenu principal</p>
          {isEdit ? (
            <>
              <p style={{ margin: "0 0 10px", fontSize: 12, color: "var(--muted)" }}>
                S&apos;édite dans un onglet dédié, avec le même rendu que sur le site public.
              </p>
              <button
                type="button"
                className="button"
                style={{ width: "fit-content" }}
                onClick={() =>
                  window.open(`/admin/productions/${initialData.id}/edit/contenu`, "_blank", "noopener,noreferrer")
                }
              >
                <PenLine size={15} strokeWidth={1.75} />
                Modifier le contenu principal
              </button>
            </>
          ) : (
            <p style={{ margin: 0, fontSize: 12, color: "var(--muted)" }}>
              Disponible après le premier enregistrement de la production.
            </p>
          )}
        </div>

        {/* Relations sous-thèmes */}
        {subThemes.length > 0 && (
          <div className="form-section">
            <p className="form-section-title">Sous-thèmes</p>
            <p style={{ margin: "0 0 10px", fontSize: 12, color: "var(--muted)" }}>
              Cochez les sujets traités par cette production.
            </p>
            {[...subThemesByTheme.entries()].map(([themeId, items]) => (
              <div key={themeId} style={{ marginBottom: 14 }}>
                <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 600, color: "var(--ink)" }}>
                  {themeTitleById.get(themeId) ?? "Thème"}
                </p>
                <CheckboxMultiSelect
                  idPrefix="subtheme"
                  items={items.map((st) => ({ id: st.id, label: st.title }))}
                  selected={selectedSubThemes}
                  onChange={setSelectedSubThemes}
                />
              </div>
            ))}
          </div>
        )}

        {/* Relations auteurs */}
        {authors.length > 0 && (
          <div className="form-section">
            <p className="form-section-title">Fiches auteur</p>
            <p style={{ margin: "0 0 10px", fontSize: 12, color: "var(--muted)" }}>
              En complément (ou au lieu) du champ « Auteur » en texte libre ci-dessus.
            </p>
            <CheckboxMultiSelect
              idPrefix="author"
              items={authors.map((a) => ({ id: a.id, label: a.name }))}
              selected={selectedAuthors}
              onChange={setSelectedAuthors}
            />
          </div>
        )}

        {/* Ressources / références */}
        {mediaItems.length > 0 && (
          <div className="form-section">
            <p className="form-section-title">Ressources / références liées</p>
            <p style={{ margin: "0 0 10px", fontSize: 12, color: "var(--muted)" }}>
              Documents ou médias de la médiathèque cités par cette production.
            </p>
            <CheckboxMultiSelect
              idPrefix="resource"
              items={mediaItems.map((m) => ({ id: m.id, label: m.title }))}
              selected={selectedResources}
              onChange={setSelectedResources}
            />
          </div>
        )}

        {/* PDF joint */}
        <div className="form-section">
          <p className="form-section-title">Document PDF</p>
          <div className="form-field">
            <label className="field-label">Fichier</label>
            {fileName ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--ink)" }}>
                  <FileText size={15} strokeWidth={1.75} />
                  {fileName}
                </span>
                <button
                  type="button"
                  className="btn-sm"
                  onClick={() => {
                    setFileId("");
                    setFileName(null);
                  }}
                >
                  <X size={13} strokeWidth={2} />
                  Retirer
                </button>
              </div>
            ) : (
              <label className="button" style={{ width: "fit-content" }}>
                {uploading ? "Import en cours..." : "Importer un PDF"}
                <input
                  hidden
                  type="file"
                  accept="application/pdf"
                  disabled={uploading}
                  onChange={(e) => e.target.files?.[0] && handlePdfUpload(e.target.files[0])}
                />
              </label>
            )}
          </div>
          <div className="form-field">
            <label className="field-label" htmlFor="downloadLabel">
              Libellé du bouton de téléchargement
            </label>
            <input
              id="downloadLabel"
              name="downloadLabel"
              defaultValue={initialData?.downloadLabel ?? ""}
              placeholder="Ex. : Télécharger le rapport complet (PDF)"
            />
          </div>
        </div>

        {/* Publication */}
        <div className="form-section">
          <p className="form-section-title">Publication</p>
          <div className="form-field" style={{ maxWidth: 280 }}>
            <label className="field-label">Statut</label>
            <select name="status" defaultValue={initialData?.status ?? "draft"}>
              <option value="draft">Brouillon</option>
              <option value="published">Publié</option>
              <option value="archived">Archivé</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          {publicHref && (
            <a href={publicHref} target="_blank" rel="noopener noreferrer" className="btn-preview">
              <ExternalLink size={14} strokeWidth={1.75} />
              Voir sur le site
            </a>
          )}
          <Link href="/admin/productions" className="button">
            Annuler
          </Link>
          <button type="submit" className="button primary" disabled={isPending}>
            {isPending ? "Enregistrement..." : isEdit ? "Mettre à jour" : "Créer la production"}
          </button>
        </div>
      </div>
    </form>
  );
}
