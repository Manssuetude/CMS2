"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ExternalLink } from "lucide-react";
import type { Event, Dossier, JournalEntry, Media, Production, Project } from "@/types/cms";
import { DossierItemPicker, type DossierPickableItem, type DossierPickerGroup } from "./DossierItemPicker";

type ActionFn = (prevState: string | null, formData: FormData) => Promise<string | null>;

const RichTextEditor = dynamic(() => import("@/components/editor/RichTextEditor").then((m) => m.RichTextEditor), {
  ssr: false,
  loading: () => (
    <div
      style={{
        minHeight: 200,
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

function toSlug(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface Props {
  initialData?: Dossier;
  initialItems?: DossierPickableItem[];
  action: ActionFn;
  productions?: Production[];
  events?: Event[];
  projects?: Project[];
  resources?: Media[];
  journalEntries?: JournalEntry[];
  images?: Media[];
}

export function DossierForm({
  initialData,
  initialItems = [],
  action,
  productions = [],
  events = [],
  projects = [],
  resources = [],
  journalEntries = [],
  images = [],
}: Props) {
  const isEdit = !!initialData;
  const [error, formAction, isPending] = useActionState(action, null);
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [items, setItems] = useState<DossierPickableItem[]>(initialItems);
  const publicHref = isEdit ? `/dossiers/${initialData.slug}` : null;

  const groups: DossierPickerGroup[] = [
    { entityType: "production", label: "Productions", items: productions.map((p) => ({ id: p.id, label: p.title })) },
    { entityType: "event", label: "Événements", items: events.map((e) => ({ id: e.id, label: e.title })) },
    { entityType: "project", label: "Projets", items: projects.map((p) => ({ id: p.id, label: p.title })) },
    { entityType: "resource", label: "Ressources", items: resources.map((r) => ({ id: r.id, label: r.title })) },
    { entityType: "journal_entry", label: "Journal", items: journalEntries.map((e) => ({ id: e.id, label: e.title })) },
  ];

  return (
    <form action={formAction}>
      {isEdit && <input type="hidden" name="id" value={initialData.id} />}
      {!isEdit && <input type="hidden" name="slug" value={slug} />}
      <input type="hidden" name="description" value={description} />
      <input type="hidden" name="items" value={JSON.stringify(items)} />

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
              placeholder="Ex. : Comprendre les intégrations régionales africaines"
              onChange={(e) => {
                if (!isEdit) setSlug(toSlug(e.target.value));
              }}
            />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="field-label" htmlFor="mode">
                Mode
              </label>
              <select id="mode" name="mode" defaultValue={initialData?.mode ?? "libre"}>
                <option value="libre">Libre (grille)</option>
                <option value="guide">Guidé (parcours séquentiel numéroté)</option>
              </select>
            </div>
            <div className="form-field">
              <label className="field-label" htmlFor="imageId">
                Image
              </label>
              <select id="imageId" name="imageId" defaultValue={initialData?.imageId ?? ""}>
                <option value="">Aucune image</option>
                {images.map((img) => (
                  <option key={img.id} value={img.id}>
                    {img.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <p className="form-section-title">Introduction éditoriale</p>
          <RichTextEditor value={description} onChange={setDescription} />
        </div>

        <div className="form-section">
          <p className="form-section-title">Contenus du dossier</p>
          <p style={{ margin: "0 0 10px", fontSize: 12, color: "var(--muted)" }}>
            Cochez les contenus à inclure, puis ajustez leur ordre — déterminant en mode guidé, indicatif en mode libre.
          </p>
          <DossierItemPicker groups={groups} value={items} onChange={setItems} />
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
          <Link href="/admin/dossiers" className="button">
            Annuler
          </Link>
          <button type="submit" className="button primary" disabled={isPending}>
            {isPending ? "Enregistrement..." : isEdit ? "Mettre à jour" : "Créer le dossier"}
          </button>
        </div>
      </div>
    </form>
  );
}
