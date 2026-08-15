"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ExternalLink } from "lucide-react";
import type { Production, SubTheme, Theme } from "@/types/cms";

type ActionFn = (prevState: string | null, formData: FormData) => Promise<string | null>;

const RichTextEditor = dynamic(() => import("@/components/editor/RichTextEditor").then((m) => m.RichTextEditor), {
  ssr: false,
  loading: () => (
    <div
      style={{
        minHeight: 400,
        border: "1px solid var(--line)",
        borderRadius: "var(--radius)",
        background: "var(--soft)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--muted)",
        fontSize: 13,
      }}
    >
      Chargement de l&apos;éditeur...
    </div>
  ),
});

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
}

export function ProductionForm({ initialData, action, themes = [], subThemes = [] }: Props) {
  const isEdit = !!initialData;
  const [error, formAction, isPending] = useActionState(action, null);
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [body, setBody] = useState(initialData?.body ?? "");

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
      <input type="hidden" name="body" value={body} />

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
              <select name="type" defaultValue={initialData?.type ?? ""} required>
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

          <div className="form-row">
            <div className="form-field">
              <label className="field-label">Date de publication</label>
              <input type="date" name="date" defaultValue={initialData?.date?.slice(0, 10) ?? ""} />
            </div>
            <div className="form-field">
              <label className="field-label">Temps de lecture</label>
              <input
                type="text"
                name="readingTime"
                defaultValue={initialData?.readingTime ?? ""}
                placeholder="Ex. : 7 min"
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
          <RichTextEditor value={body} onChange={setBody} />
        </div>

        {/* Relation sous-thème */}
        {subThemes.length > 0 && (
          <div className="form-section">
            <p className="form-section-title">Sous-thème</p>
            <div className="form-field">
              <label className="field-label" htmlFor="subThemeId">
                Sujet traité
              </label>
              <select id="subThemeId" name="subThemeId" defaultValue={initialData?.subThemeId ?? ""}>
                <option value="">Aucun sous-thème</option>
                {[...subThemesByTheme.entries()].map(([themeId, items]) => (
                  <optgroup key={themeId} label={themeTitleById.get(themeId) ?? "Thème"}>
                    {items.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.title}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>
        )}

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
