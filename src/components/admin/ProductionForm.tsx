"use client";

import { useActionState, useCallback, useMemo, useRef, useState } from "react";
import { Eye } from "lucide-react";
import type { Author, ContentStatus, Media, Production, SubTheme, Theme } from "@/types/cms";
import { splitIntoParts } from "@/utils/articleParts";
import { PRODUCTION_TYPE_LABELS, productionTypeLabel } from "@/constants/productionTypes";
import {
  checkProductionPublication,
  publicationBlockedMessage,
  publicationLegacyMessage,
} from "@/utils/productionPublication";
import { CheckboxMultiSelect } from "@/components/admin/CheckboxMultiSelect";
import { SortableMediaGallery } from "@/components/media/SortableMediaGallery";
import {
  ArticleFilesModal,
  type ArticleFilesMode,
  type ArticleFilesResult,
} from "@/components/admin/ArticleFilesModal";
import { ProductionFilesPanel } from "@/components/admin/ProductionFilesPanel";
import { ProductionPreviewModal } from "@/components/admin/ProductionPreviewModal";
import { AdminFormBar } from "@/components/admin/AdminFormBar";

type ActionFn = (prevState: string | null, formData: FormData) => Promise<string | null>;

const TYPES = Object.keys(PRODUCTION_TYPE_LABELS);

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
  /** Nom du PDF déjà attaché (médiathèque). */
  initialPdfName?: string | null;
}

// Texte de l'article : celui enregistré, ou celui d'un Word importé pendant
// cette visite (envoyé avec le formulaire seulement dans ce cas).
type WordState = { html: string | null; fileName: string | null; importedAt: string | null; pending: boolean };
type PdfState = { id: string; fileName: string | null; pending: boolean };
type PreviewState = { body: string | null; fileId: string | null; partTitles: string[]; canSave: boolean };

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
  initialPdfName = null,
}: Props) {
  const isEdit = !!initialData;
  const [error, formAction] = useActionState(action, null);
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [type, setType] = useState(initialData?.type ?? "");
  const [selectedSubThemes, setSelectedSubThemes] = useState<string[]>(initialSubThemeIds);
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>(initialAuthorIds);
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<ContentStatus>(initialData?.status ?? "draft");
  const [word, setWord] = useState<WordState>({
    html: initialData?.body?.trim() ? initialData.body : null,
    fileName: initialData?.bodySourceName ?? null,
    importedAt: initialData?.bodyImportedAt ?? null,
    pending: false,
  });
  const [pdf, setPdf] = useState<PdfState>({
    id: initialData?.fileId ?? "",
    fileName: initialPdfName,
    pending: false,
  });
  const [pages, setPages] = useState(initialData?.pages ?? "");
  const [filesModal, setFilesModal] = useState<ArticleFilesMode | null>(null);
  const [preview, setPreview] = useState<PreviewState | null>(null);

  const partTitles = useMemo(() => splitIntoParts(word.html).map((part) => part.title), [word.html]);
  const publication = checkProductionPublication({
    previousStatus: initialData?.status ?? null,
    nextStatus: status,
    files: { hasWord: !!word.html, hasPdf: !!pdf.id },
  });
  const blockedMessage = publication.allowed ? null : publicationBlockedMessage(publication.missing);
  const legacyWarning = publication.legacyWarning ? publicationLegacyMessage(publication.missing) : null;

  const closePreview = useCallback(() => setPreview(null), []);
  const closeFilesModal = useCallback(() => setFilesModal(null), []);

  function openFilesModal(kind: "word" | "pdf") {
    // Aucun des deux fichiers : on les demande ensemble.
    setFilesModal(!word.html && !pdf.id ? "both" : kind);
  }

  function applyFiles(result: ArticleFilesResult) {
    if (result.word) {
      setWord({ html: result.word.html, fileName: result.word.fileName, importedAt: null, pending: true });
    }
    if (result.pdf) {
      setPdf({ id: result.pdf.id, fileName: result.pdf.name, pending: true });
      if (result.pdf.pages) setPages(String(result.pdf.pages));
    }
    setFilesModal(null);
  }

  function previewFiles(result: ArticleFilesResult) {
    const html = result.word?.html ?? word.html;
    setPreview({
      body: result.word ? result.word.html : null,
      fileId: result.pdf ? result.pdf.id : null,
      partTitles: splitIntoParts(html).map((part) => part.title),
      // Fichiers pas encore validés : on ne propose pas d'enregistrer depuis l'aperçu.
      canSave: false,
    });
  }

  const themeTitleById = new Map(themes.map((t) => [t.id, t.title]));
  const subThemesByTheme = new Map<string, SubTheme[]>();
  for (const st of subThemes) {
    const list = subThemesByTheme.get(st.themeId) ?? [];
    list.push(st);
    subThemesByTheme.set(st.themeId, list);
  }

  return (
    <form action={formAction} ref={formRef}>
      {isEdit && <input type="hidden" name="id" value={initialData.id} />}
      {!isEdit && <input type="hidden" name="slug" value={slug} />}
      <input type="hidden" name="subThemeIds" value={selectedSubThemes.join(",")} />
      <input type="hidden" name="authorIds" value={selectedAuthors.join(",")} />
      <input type="hidden" name="fileId" value={pdf.id} />
      {word.pending && (
        <>
          <input type="hidden" name="body" value={word.html ?? ""} />
          <input type="hidden" name="bodySourceName" value={word.fileName ?? ""} />
        </>
      )}

      {error && <p className="form-error">{error}</p>}

      <div className="content-form">
        {/* Fichiers de l'article (Word + PDF) */}
        <div className="form-section">
          <p className="form-section-title">Fichiers de l&apos;article</p>
          <ProductionFilesPanel
            word={{
              present: !!word.html,
              fileName: word.fileName,
              importedAt: word.importedAt,
              pending: word.pending,
            }}
            pdf={{ present: !!pdf.id, fileName: pdf.fileName, pending: pdf.pending }}
            partTitles={partTitles}
            pages={pages}
            onPagesChange={setPages}
            downloadLabel={initialData?.downloadLabel}
            legacyWarning={legacyWarning}
            onReplace={openFilesModal}
            onPreview={() => setPreview({ body: null, fileId: null, partTitles, canSave: true })}
          />
        </div>

        {/* Informations */}
        <div className="form-section">
          <p className="form-section-title">Informations générales</p>

          <div className="form-field">
            <label className="field-label" htmlFor="title">
              Titre *
            </label>
            <input
              id="title"
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
              <label className="field-label" htmlFor="type">
                Type *
              </label>
              <select id="type" name="type" value={type} onChange={(e) => setType(e.target.value)} required>
                <option value="" disabled>
                  Choisir un type...
                </option>
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {productionTypeLabel(t)}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label className="field-label" htmlFor="author">
                Auteur
              </label>
              <input
                id="author"
                type="text"
                name="author"
                defaultValue={initialData?.author ?? ""}
                placeholder="Nom de l'auteur ou de l'équipe"
              />
            </div>
          </div>

          {(type === "Video" || type === "Podcast") && (
            <div className="form-field">
              <label className="field-label" htmlFor="videoUrl">
                {type === "Video" ? "URL vidéo (YouTube ou Vimeo)" : "URL audio (fichier .mp3 ou lien YouTube/Vimeo)"}
              </label>
              <input
                id="videoUrl"
                type="url"
                name="videoUrl"
                defaultValue={initialData?.videoUrl ?? ""}
                placeholder={type === "Video" ? "https://www.youtube.com/watch?v=..." : "https://.../episode.mp3"}
              />
            </div>
          )}

          <div className="form-row">
            <div className="form-field">
              <label className="field-label" htmlFor="date">
                Date de publication
              </label>
              <input id="date" type="date" name="date" defaultValue={initialData?.date?.slice(0, 10) ?? ""} />
            </div>
            <div className="form-field">
              <label className="field-label" htmlFor="readingTime">
                {type === "Video" || type === "Podcast" ? "Durée" : "Temps de lecture (optionnel)"}
              </label>
              <input
                id="readingTime"
                type="text"
                name="readingTime"
                defaultValue={initialData?.readingTime ?? ""}
                placeholder={
                  type === "Video" || type === "Podcast" ? "Ex. : 12 min" : "Calculé automatiquement si laissé vide"
                }
              />
            </div>
          </div>

          <div className="form-checkbox">
            <input type="checkbox" id="featured" name="featured" defaultChecked={initialData?.featured} />
            <label htmlFor="featured">Mettre en vedette</label>
          </div>
        </div>

        {/* Description courte */}
        <div className="form-section">
          <p className="form-section-title">Résumé court</p>
          <div className="form-field">
            <label className="field-label" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              defaultValue={initialData?.description ?? ""}
              rows={3}
              placeholder="Description courte pour les listes et les metas SEO..."
            />
          </div>
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
        <div className="form-section">
          <p className="form-section-title">Ressources / références liées</p>
          <p style={{ margin: "0 0 10px", fontSize: 12, color: "var(--muted)" }}>
            Documents ou médias de la médiathèque cités par cette production.
          </p>
          <SortableMediaGallery
            name="resourceIds"
            initialMedia={mediaItems}
            initialSelectedIds={initialResourceIds}
            buttonLabel="Ajouter des ressources"
          />
        </div>

        {/* SEO */}
        <div className="form-section">
          <p className="form-section-title">SEO</p>
          <div className="form-field">
            <label className="field-label" htmlFor="seoTitle">
              Titre SEO (onglet navigateur)
            </label>
            <input
              id="seoTitle"
              name="seoTitle"
              defaultValue={initialData?.seoTitle ?? ""}
              placeholder={initialData?.title}
            />
          </div>
          <div className="form-field">
            <label className="field-label" htmlFor="seoDescription">
              Description SEO
            </label>
            <textarea
              id="seoDescription"
              name="seoDescription"
              defaultValue={initialData?.seoDescription ?? ""}
              rows={3}
              placeholder={initialData?.description ?? ""}
            />
          </div>
        </div>
      </div>

      <AdminFormBar
        status={{ value: status, onChange: setStatus }}
        blockedMessage={blockedMessage}
        error={error}
        isNew={!isEdit}
        submitLabel={isEdit ? "Enregistrer" : "Créer la production"}
        actions={
          <button
            type="button"
            className="button"
            disabled={partTitles.length === 0}
            title={partTitles.length === 0 ? "Importez le Word pour voir l'aperçu" : undefined}
            onClick={() => setPreview({ body: null, fileId: null, partTitles, canSave: true })}
          >
            <Eye size={15} strokeWidth={1.75} aria-hidden="true" />
            Aperçu
          </button>
        }
      />

      {filesModal && (
        <ArticleFilesModal
          mode={filesModal}
          productionId={initialData?.id}
          onClose={closeFilesModal}
          onValidate={applyFiles}
          onPreview={previewFiles}
        />
      )}
      {preview && (
        <ProductionPreviewModal
          formRef={formRef}
          partTitles={preview.partTitles}
          body={preview.body}
          fileId={preview.fileId}
          onClose={closePreview}
          onSave={
            preview.canSave
              ? () => {
                  setPreview(null);
                  formRef.current?.requestSubmit();
                }
              : undefined
          }
          saveDisabled={!!blockedMessage}
        />
      )}
    </form>
  );
}
