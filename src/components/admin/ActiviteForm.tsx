"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ExternalLink, Plus, X } from "lucide-react";
import type { Activity, Project, Speaker, Theme } from "@/types/cms";
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

const FORMATS = [
  "Debat & Conference",
  "Atelier & Seance de travail",
  "Formation & Masterclass",
  "Visite & Immersion",
  "Rencontre & Networking",
];

function toSlug(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface Props {
  initialData?: Activity;
  action: ActionFn;
  themes?: Theme[];
  initialThemeIds?: string[];
  projects?: Project[];
  initialProjectIds?: string[];
}

export function ActiviteForm({
  initialData,
  action,
  themes = [],
  initialThemeIds = [],
  projects = [],
  initialProjectIds = [],
}: Props) {
  const isEdit = !!initialData;
  const [error, formAction, isPending] = useActionState(action, null);
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [body, setBody] = useState(initialData?.body ?? "");
  const [speakers, setSpeakers] = useState<Speaker[]>(initialData?.speakers ?? []);
  const [selectedThemes, setSelectedThemes] = useState<string[]>(initialThemeIds);
  const [selectedProjects, setSelectedProjects] = useState<string[]>(initialProjectIds);
  const publicHref = isEdit ? `/activites/${initialData.slug}` : null;

  function updateSpeaker(index: number, field: keyof Speaker, value: string) {
    setSpeakers((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  }

  return (
    <form action={formAction}>
      {isEdit && <input type="hidden" name="id" value={initialData.id} />}
      {!isEdit && <input type="hidden" name="slug" value={slug} />}
      <input type="hidden" name="body" value={body} />
      <input type="hidden" name="speakers" value={JSON.stringify(speakers.filter((s) => s.name.trim()))} />
      <input type="hidden" name="themeIds" value={selectedThemes.join(",")} />
      <input type="hidden" name="projectIds" value={selectedProjects.join(",")} />

      {error && <p className="form-error">{error}</p>}

      <div className="content-form">
        <div className="form-section">
          <p className="form-section-title">Informations générales</p>

          <div className="form-field">
            <label className="field-label">Titre *</label>
            <input
              type="text"
              name="title"
              defaultValue={initialData?.title}
              required
              placeholder="Ex. : Atelier prospectif sur les modèles industriels"
              onChange={(e) => {
                if (!isEdit) setSlug(toSlug(e.target.value));
              }}
            />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="field-label">Format *</label>
              <select name="format" defaultValue={initialData?.format ?? ""} required>
                <option value="" disabled>
                  Choisir un format...
                </option>
                {FORMATS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label className="field-label">Date</label>
              <input type="date" name="date" defaultValue={initialData?.date?.slice(0, 10) ?? ""} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="field-label">Heure de début</label>
              <input type="time" name="startTime" defaultValue={initialData?.startTime ?? ""} />
            </div>
            <div className="form-field">
              <label className="field-label">Heure de fin</label>
              <input type="time" name="endTime" defaultValue={initialData?.endTime ?? ""} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="field-label">Lieu / adresse</label>
              <input
                type="text"
                name="location"
                defaultValue={initialData?.location ?? ""}
                placeholder="Ex. : 12 rue de la République, Paris"
              />
            </div>
            <div className="form-field">
              <label className="field-label">Capacité</label>
              <input
                type="text"
                name="capacity"
                defaultValue={initialData?.capacity ?? ""}
                placeholder="Ex. : 50 places"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="field-label">Lien EventBrite</label>
              <input
                type="url"
                name="eventbriteUrl"
                defaultValue={initialData?.eventbriteUrl ?? ""}
                placeholder="https://www.eventbrite.fr/e/..."
              />
            </div>
            <div className="form-field">
              <label className="field-label">Statut d&apos;inscription</label>
              <select name="registrationStatus" defaultValue={initialData?.registrationStatus ?? ""}>
                <option value="">Automatique (selon la date)</option>
                <option value="a-venir">À venir</option>
                <option value="ouvertes">Inscriptions ouvertes</option>
                <option value="complet">Complet</option>
                <option value="termine">Terminé</option>
              </select>
            </div>
          </div>
        </div>

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

        <div className="form-section">
          <p className="form-section-title">Contenu principal</p>
          <RichTextEditor value={body} onChange={setBody} />
        </div>

        {/* Intervenants structurés */}
        <div className="form-section">
          <p className="form-section-title">Intervenants</p>
          <p style={{ margin: "0 0 10px", fontSize: 12, color: "var(--muted)" }}>
            Nom et rôle de chaque intervenant (au lieu d&apos;un texte libre).
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {speakers.map((speaker, index) => (
              <div key={index} className="form-row" style={{ alignItems: "flex-end" }}>
                <div className="form-field">
                  <label className="field-label">Nom</label>
                  <input
                    value={speaker.name}
                    onChange={(e) => updateSpeaker(index, "name", e.target.value)}
                    placeholder="Prénom Nom"
                  />
                </div>
                <div className="form-field">
                  <label className="field-label">Rôle</label>
                  <input
                    value={speaker.role ?? ""}
                    onChange={(e) => updateSpeaker(index, "role", e.target.value)}
                    placeholder="Ex. : Modérateur, Invité..."
                  />
                </div>
                <button
                  type="button"
                  className="btn-sm"
                  onClick={() => setSpeakers((prev) => prev.filter((_, i) => i !== index))}
                  aria-label="Retirer cet intervenant"
                >
                  <X size={13} strokeWidth={2} />
                </button>
              </div>
            ))}
            <button
              type="button"
              className="button"
              style={{ width: "fit-content" }}
              onClick={() => setSpeakers((prev) => [...prev, { name: "", role: "" }])}
            >
              <Plus size={15} strokeWidth={2} />
              Ajouter un intervenant
            </button>
          </div>
        </div>

        {/* Relations thèmes */}
        {themes.length > 0 && (
          <div className="form-section">
            <p className="form-section-title">Thèmes</p>
            <p style={{ margin: "0 0 10px", fontSize: 12, color: "var(--muted)" }}>
              Thèmes éditoriaux auxquels se rattache cette activité.
            </p>
            <CheckboxMultiSelect
              idPrefix="theme"
              items={themes.map((t) => ({ id: t.id, label: t.title }))}
              selected={selectedThemes}
              onChange={setSelectedThemes}
            />
          </div>
        )}

        {/* Relations projets */}
        {projects.length > 0 && (
          <div className="form-section">
            <p className="form-section-title">Projets</p>
            <p style={{ margin: "0 0 10px", fontSize: 12, color: "var(--muted)" }}>
              Projets dans le cadre desquels cette activité est organisée.
            </p>
            <CheckboxMultiSelect
              idPrefix="project"
              items={projects.map((p) => ({ id: p.id, label: p.title }))}
              selected={selectedProjects}
              onChange={setSelectedProjects}
            />
          </div>
        )}

        <div className="form-section">
          <p className="form-section-title">Publication</p>
          <div className="form-row">
            <div className="form-field">
              <label className="field-label">Statut</label>
              <select name="status" defaultValue={initialData?.status ?? "draft"}>
                <option value="draft">Brouillon</option>
                <option value="published">Publié</option>
                <option value="archived">Archivé</option>
              </select>
            </div>
            <div className="form-field">
              <label className="field-label">Avancement</label>
              <select name="progressStatus" defaultValue={initialData?.progressStatus ?? ""}>
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
          <Link href="/admin/activites" className="button">
            Annuler
          </Link>
          <button type="submit" className="button primary" disabled={isPending}>
            {isPending ? "Enregistrement..." : isEdit ? "Mettre à jour" : "Créer l'activité"}
          </button>
        </div>
      </div>
    </form>
  );
}
