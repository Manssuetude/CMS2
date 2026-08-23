"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ExternalLink } from "lucide-react";
import type { Event, Author, JournalEntry, Media, Production, Project, Theme } from "@/types/cms";

type ActionFn = (prevState: string | null, formData: FormData) => Promise<string | null>;

const RichTextEditor = dynamic(() => import("@/components/editor/RichTextEditor").then((m) => m.RichTextEditor), {
  ssr: false,
  loading: () => (
    <div
      style={{
        minHeight: 300,
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

export const JOURNAL_CATEGORIES = ["Actualité", "Coulisses", "Réflexion", "Portrait", "Retour d'expérience"];

function toSlug(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface Props {
  initialData?: JournalEntry;
  action: ActionFn;
  authors?: Author[];
  themes?: Theme[];
  projects?: Project[];
  events?: Event[];
  productions?: Production[];
  images?: Media[];
}

export function JournalEntryForm({
  initialData,
  action,
  authors = [],
  themes = [],
  projects = [],
  events = [],
  productions = [],
  images = [],
}: Props) {
  const isEdit = !!initialData;
  const [error, formAction, isPending] = useActionState(action, null);
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [body, setBody] = useState(initialData?.body ?? "");
  const publicHref = isEdit ? `/journal/${initialData.slug}` : null;

  return (
    <form action={formAction}>
      {isEdit && <input type="hidden" name="id" value={initialData.id} />}
      {!isEdit && <input type="hidden" name="slug" value={slug} />}
      <input type="hidden" name="body" value={body} />

      {error && <p className="form-error">{error}</p>}

      <div className="content-form">
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
              placeholder="Ex. : Retour sur notre atelier de rentrée"
              onChange={(e) => {
                if (!isEdit) setSlug(toSlug(e.target.value));
              }}
            />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="field-label" htmlFor="category">
                Catégorie
              </label>
              <select id="category" name="category" defaultValue={initialData?.category ?? ""}>
                <option value="">Non catégorisé</option>
                {JOURNAL_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label className="field-label" htmlFor="date">
                Date
              </label>
              <input id="date" type="date" name="date" defaultValue={initialData?.date?.slice(0, 10) ?? ""} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="field-label" htmlFor="authorId">
                Auteur
              </label>
              <select id="authorId" name="authorId" defaultValue={initialData?.authorId ?? ""}>
                <option value="">Non attribué</option>
                {authors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label className="field-label" htmlFor="thumbnailId">
                Image
              </label>
              <select id="thumbnailId" name="thumbnailId" defaultValue={initialData?.thumbnailId ?? ""}>
                <option value="">Aucune image</option>
                {images.map((img) => (
                  <option key={img.id} value={img.id}>
                    {img.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-checkbox">
            <input type="checkbox" id="featured" name="featured" defaultChecked={initialData?.featured} />
            <label htmlFor="featured">Mettre en avant sur la homepage</label>
          </div>
        </div>

        <div className="form-section">
          <p className="form-section-title">Résumé court</p>
          <div className="form-field">
            <label className="field-label" htmlFor="excerpt">
              Extrait
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              defaultValue={initialData?.excerpt ?? ""}
              rows={3}
              placeholder="Résumé court affiché dans le flux du Journal..."
            />
          </div>
        </div>

        <div className="form-section">
          <p className="form-section-title">Contenu</p>
          <RichTextEditor value={body} onChange={setBody} />
        </div>

        <div className="form-section">
          <p className="form-section-title">Contexte lié (facultatif)</p>
          <p style={{ margin: "0 0 10px", fontSize: 12, color: "var(--muted)" }}>
            Rattache cette entrée à un thème, un projet, un événement ou une production, elle apparaîtra alors
            automatiquement dans son contexte (ex. chronologie du projet).
          </p>
          <div className="form-row">
            <div className="form-field">
              <label className="field-label" htmlFor="themeId">
                Thème
              </label>
              <select id="themeId" name="themeId" defaultValue={initialData?.themeId ?? ""}>
                <option value="">Aucun</option>
                {themes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label className="field-label" htmlFor="projectId">
                Projet
              </label>
              <select id="projectId" name="projectId" defaultValue={initialData?.projectId ?? ""}>
                <option value="">Aucun</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label className="field-label" htmlFor="eventId">
                Événement
              </label>
              <select id="eventId" name="eventId" defaultValue={initialData?.eventId ?? ""}>
                <option value="">Aucun</option>
                {events.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label className="field-label" htmlFor="productionId">
                Production
              </label>
              <select id="productionId" name="productionId" defaultValue={initialData?.productionId ?? ""}>
                <option value="">Aucune</option>
                {productions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <p className="form-section-title">Publication</p>
          <div className="form-field" style={{ maxWidth: 280 }}>
            <label className="field-label" htmlFor="status">
              Statut
            </label>
            <select id="status" name="status" defaultValue={initialData?.status ?? "draft"}>
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
          <Link href="/admin/journal" className="button">
            Annuler
          </Link>
          <button type="submit" className="button primary" disabled={isPending}>
            {isPending ? "Enregistrement..." : isEdit ? "Mettre à jour" : "Créer l'entrée"}
          </button>
        </div>
      </div>
    </form>
  );
}
