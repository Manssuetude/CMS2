"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ExternalLink } from "lucide-react";
import type { Event, Production, Project, Theme } from "@/types/cms";
import { CheckboxMultiSelect } from "@/components/admin/CheckboxMultiSelect";
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

const CATEGORIES = [
  "Recherche & Reflexion",
  "Plaidoyer & Influence",
  "Renforcement des capacites",
  "Innovation & Solutions",
  "Jeunesse & Leadership",
];

const PRIORITIES = ["Haute", "Moyenne", "Basse"];

function toSlug(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface Props {
  initialData?: Project;
  action: ActionFn;
  themes?: Theme[];
  initialThemeIds?: string[];
  productions?: Production[];
  initialProductionIds?: string[];
  events?: Event[];
  initialEventIds?: string[];
}

export function ProjetForm({
  initialData,
  action,
  themes = [],
  initialThemeIds = [],
  productions = [],
  initialProductionIds = [],
  events = [],
  initialEventIds = [],
}: Props) {
  const isEdit = !!initialData;
  const [error, formAction, isPending] = useActionState(action, null);
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [body, setBody] = useState(initialData?.body ?? "");
  const [selectedThemes, setSelectedThemes] = useState<string[]>(initialThemeIds);
  const [selectedProductions, setSelectedProductions] = useState<string[]>(initialProductionIds);
  const [selectedEvents, setSelectedEvents] = useState<string[]>(initialEventIds);
  const publicHref = isEdit ? `/projets/${initialData.slug}` : null;

  return (
    <form action={formAction}>
      {isEdit && <input type="hidden" name="id" value={initialData.id} />}
      {!isEdit && <input type="hidden" name="slug" value={slug} />}
      <input type="hidden" name="body" value={body} />
      <input type="hidden" name="themeIds" value={selectedThemes.join(",")} />
      <input type="hidden" name="productionIds" value={selectedProductions.join(",")} />
      <input type="hidden" name="eventIds" value={selectedEvents.join(",")} />

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
              placeholder="Ex. : Étude sur la transformation industrielle en Afrique centrale"
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
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label className="field-label" htmlFor="priority">
                Priorité
              </label>
              <select id="priority" name="priority" defaultValue={initialData?.priority ?? ""}>
                <option value="">Non définie</option>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-checkbox">
            <input type="checkbox" id="featured" name="featured" defaultChecked={initialData?.featured} />
            <label htmlFor="featured">Mettre en avant sur le site</label>
          </div>
        </div>

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

        <div className="form-section">
          <p className="form-section-title">Contenu principal</p>
          <RichTextEditor value={body} onChange={setBody} />
        </div>

        {themes.length > 0 && (
          <div className="form-section">
            <p className="form-section-title">Thèmes</p>
            <p style={{ margin: "0 0 10px", fontSize: 12, color: "var(--muted)" }}>
              Thèmes éditoriaux auxquels se rattache ce projet.
            </p>
            <CheckboxMultiSelect
              idPrefix="theme"
              items={themes.map((t) => ({ id: t.id, label: t.title }))}
              selected={selectedThemes}
              onChange={setSelectedThemes}
            />
          </div>
        )}

        {productions.length > 0 && (
          <div className="form-section">
            <p className="form-section-title">Productions liées</p>
            <CheckboxMultiSelect
              idPrefix="production"
              items={productions.map((p) => ({ id: p.id, label: p.title }))}
              selected={selectedProductions}
              onChange={setSelectedProductions}
            />
          </div>
        )}

        {events.length > 0 && (
          <div className="form-section">
            <p className="form-section-title">Événements liés</p>
            <CheckboxMultiSelect
              idPrefix="event"
              items={events.map((e) => ({ id: e.id, label: e.title }))}
              selected={selectedEvents}
              onChange={setSelectedEvents}
            />
          </div>
        )}

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

        <div className="form-section">
          <p className="form-section-title">Publication</p>
          <div className="form-row">
            <div className="form-field">
              <label className="field-label" htmlFor="status">
                Statut
              </label>
              <select id="status" name="status" defaultValue={initialData?.status ?? "draft"}>
                <option value="draft">Brouillon</option>
                <option value="published">Publié</option>
                <option value="archived">Archivé</option>
              </select>
            </div>
            <div className="form-field">
              <label className="field-label" htmlFor="progressStatus">
                Avancement
              </label>
              <select id="progressStatus" name="progressStatus" defaultValue={initialData?.progressStatus ?? ""}>
                <option value="">Non défini</option>
                <option value="idea">Idée</option>
                <option value="preparation">En préparation</option>
                <option value="active">En cours</option>
                <option value="completed">Terminé</option>
                <option value="paused">En pause</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-actions">
          {publicHref && (
            <a href={publicHref} target="_blank" rel="noopener noreferrer" className="btn-preview">
              <ExternalLink size={14} strokeWidth={1.75} />
              Voir sur le site
            </a>
          )}
          <Link href="/admin/projets" className="button">
            Annuler
          </Link>
          <button type="submit" className="button primary" disabled={isPending}>
            {isPending ? "Enregistrement..." : isEdit ? "Mettre à jour" : "Créer le projet"}
          </button>
        </div>
      </div>
    </form>
  );
}
