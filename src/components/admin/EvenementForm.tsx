"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ExternalLink, Plus, X } from "lucide-react";
import type {
  Event,
  EventAnimator,
  ActivityFormat,
  Author,
  Media,
  Project,
  Speaker,
  SubTheme,
  Theme,
} from "@/types/cms";
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
  initialData?: Event;
  action: ActionFn;
  themes?: Theme[];
  initialThemeIds?: string[];
  subThemes?: SubTheme[];
  initialSubThemeIds?: string[];
  projects?: Project[];
  initialProjectIds?: string[];
  activityFormats?: ActivityFormat[];
  initialFormatIds?: string[];
  authors?: Author[];
  initialAnimators?: EventAnimator[];
  images?: Media[];
}

export function EvenementForm({
  initialData,
  action,
  themes = [],
  initialThemeIds = [],
  subThemes = [],
  initialSubThemeIds = [],
  projects = [],
  initialProjectIds = [],
  activityFormats = [],
  initialFormatIds = [],
  authors = [],
  initialAnimators = [],
  images = [],
}: Props) {
  const isEdit = !!initialData;
  const [error, formAction, isPending] = useActionState(action, null);
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [body, setBody] = useState(initialData?.body ?? "");
  const [speakers, setSpeakers] = useState<Speaker[]>(initialData?.speakers ?? []);
  const [selectedThemes, setSelectedThemes] = useState<string[]>(initialThemeIds);
  const [selectedSubThemes, setSelectedSubThemes] = useState<string[]>(initialSubThemeIds);
  const [selectedProjects, setSelectedProjects] = useState<string[]>(initialProjectIds);
  const [selectedFormats, setSelectedFormats] = useState<string[]>(initialFormatIds);
  const [animators, setAnimators] = useState<EventAnimator[]>(initialAnimators);
  const [selectedGallery, setSelectedGallery] = useState<string[]>(initialData?.gallery ?? []);
  const publicHref = isEdit ? `/evenements/${initialData.slug}` : null;
  const mentionItems = useMemo(() => activityFormats.map((f) => ({ id: f.id, title: f.title })), [activityFormats]);
  const themeTitleById = new Map(themes.map((t) => [t.id, t.title]));
  const subThemesByTheme = new Map<string, SubTheme[]>();
  for (const st of subThemes) {
    const list = subThemesByTheme.get(st.themeId) ?? [];
    list.push(st);
    subThemesByTheme.set(st.themeId, list);
  }

  function updateSpeaker(index: number, field: keyof Speaker, value: string) {
    setSpeakers((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  }

  function updateAnimator(index: number, field: keyof EventAnimator, value: string) {
    setAnimators((prev) => prev.map((a, i) => (i === index ? { ...a, [field]: value } : a)));
  }

  return (
    <form action={formAction}>
      {isEdit && <input type="hidden" name="id" value={initialData.id} />}
      {!isEdit && <input type="hidden" name="slug" value={slug} />}
      <input type="hidden" name="body" value={body} />
      <input type="hidden" name="speakers" value={JSON.stringify(speakers.filter((s) => s.name.trim()))} />
      <input type="hidden" name="themeIds" value={selectedThemes.join(",")} />
      <input type="hidden" name="subThemeIds" value={selectedSubThemes.join(",")} />
      <input type="hidden" name="projectIds" value={selectedProjects.join(",")} />
      <input type="hidden" name="formatIds" value={selectedFormats.join(",")} />
      <input type="hidden" name="animators" value={JSON.stringify(animators.filter((a) => a.authorId))} />
      <input type="hidden" name="gallery" value={selectedGallery.join(",")} />

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
              placeholder="Ex. : Atelier prospectif sur les modèles industriels"
              onChange={(e) => {
                if (!isEdit) setSlug(toSlug(e.target.value));
              }}
            />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="field-label" htmlFor="format">
                Format *
              </label>
              <select id="format" name="format" defaultValue={initialData?.format ?? ""} required>
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
              <label className="field-label" htmlFor="date">
                Date
              </label>
              <input id="date" type="date" name="date" defaultValue={initialData?.date?.slice(0, 10) ?? ""} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="field-label" htmlFor="startTime">
                Heure de début
              </label>
              <input id="startTime" type="time" name="startTime" defaultValue={initialData?.startTime ?? ""} />
            </div>
            <div className="form-field">
              <label className="field-label" htmlFor="endTime">
                Heure de fin
              </label>
              <input id="endTime" type="time" name="endTime" defaultValue={initialData?.endTime ?? ""} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="field-label" htmlFor="location">
                Lieu / adresse
              </label>
              <input
                id="location"
                type="text"
                name="location"
                defaultValue={initialData?.location ?? ""}
                placeholder="Ex. : 12 rue de la République, Paris"
              />
            </div>
            <div className="form-field">
              <label className="field-label" htmlFor="capacity">
                Capacité
              </label>
              <input
                id="capacity"
                type="text"
                name="capacity"
                defaultValue={initialData?.capacity ?? ""}
                placeholder="Ex. : 50 places"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="field-label" htmlFor="eventbriteUrl">
                Lien EventBrite
              </label>
              <input
                id="eventbriteUrl"
                type="url"
                name="eventbriteUrl"
                defaultValue={initialData?.eventbriteUrl ?? ""}
                placeholder="https://www.eventbrite.fr/e/..."
              />
            </div>
            <div className="form-field">
              <label className="field-label" htmlFor="registrationStatus">
                Statut d&apos;inscription
              </label>
              <select
                id="registrationStatus"
                name="registrationStatus"
                defaultValue={initialData?.registrationStatus ?? ""}
              >
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
          {mentionItems.length > 0 && (
            <p style={{ margin: "0 0 10px", fontSize: 12, color: "var(--muted)" }}>
              Tapez <code>#</code> dans le texte pour insérer un repère cliquable vers un format d&apos;activité (sa
              description s&apos;affiche en bulle sur le site, sans avoir à la recopier ici).
            </p>
          )}
          <RichTextEditor value={body} onChange={setBody} mentionItems={mentionItems} />
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
                  <label className="field-label" htmlFor={`speaker-name-${index}`}>
                    Nom
                  </label>
                  <input
                    id={`speaker-name-${index}`}
                    value={speaker.name}
                    onChange={(e) => updateSpeaker(index, "name", e.target.value)}
                    placeholder="Prénom Nom"
                  />
                </div>
                <div className="form-field">
                  <label className="field-label" htmlFor={`speaker-role-${index}`}>
                    Rôle
                  </label>
                  <input
                    id={`speaker-role-${index}`}
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

        {/* Animateurs (lien vers le répertoire des auteurs + contribution libre) */}
        {authors.length > 0 && (
          <div className="form-section">
            <p className="form-section-title">Animateurs</p>
            <p style={{ margin: "0 0 10px", fontSize: 12, color: "var(--muted)" }}>
              Personnes ayant animé cet événement, et ce qu&apos;elles y ont fait (facultatif).
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {animators.map((animator, index) => (
                <div key={index} className="form-row" style={{ alignItems: "flex-end" }}>
                  <div className="form-field">
                    <label className="field-label" htmlFor={`animator-author-${index}`}>
                      Animateur
                    </label>
                    <select
                      id={`animator-author-${index}`}
                      value={animator.authorId}
                      onChange={(e) => updateAnimator(index, "authorId", e.target.value)}
                    >
                      <option value="">Choisir...</option>
                      {authors.map((author) => (
                        <option key={author.id} value={author.id}>
                          {author.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-field">
                    <label className="field-label" htmlFor={`animator-contribution-${index}`}>
                      Ce qu&apos;il/elle a fait
                    </label>
                    <input
                      id={`animator-contribution-${index}`}
                      value={animator.contribution ?? ""}
                      onChange={(e) => updateAnimator(index, "contribution", e.target.value)}
                      placeholder="Ex. : Animation du débat, prise de notes..."
                    />
                  </div>
                  <button
                    type="button"
                    className="btn-sm"
                    onClick={() => setAnimators((prev) => prev.filter((_, i) => i !== index))}
                    aria-label="Retirer cet animateur"
                  >
                    <X size={13} strokeWidth={2} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="button"
                style={{ width: "fit-content" }}
                onClick={() => setAnimators((prev) => [...prev, { authorId: "", contribution: "" }])}
              >
                <Plus size={15} strokeWidth={2} />
                Ajouter un animateur
              </button>
            </div>
          </div>
        )}

        {/* Compte-rendu en images (n'apparaît côté public que si l'événement est
            passé ou terminé, et seulement si des images sont ajoutées ici) */}
        {images.length > 0 && (
          <div className="form-section">
            <p className="form-section-title">Compte-rendu en images</p>
            <p style={{ margin: "0 0 10px", fontSize: 12, color: "var(--muted)" }}>
              Photos affichées sur la page publique une fois l&apos;événement passé ou marqué « Terminé ». Gérer les
              images dans <Link href="/admin/media">la médiathèque</Link>.
            </p>
            <CheckboxMultiSelect
              idPrefix="gallery"
              items={images.map((img) => ({ id: img.id, label: img.title }))}
              selected={selectedGallery}
              onChange={setSelectedGallery}
            />
          </div>
        )}

        {/* Relations thèmes */}
        {themes.length > 0 && (
          <div className="form-section">
            <p className="form-section-title">Thèmes</p>
            <p style={{ margin: "0 0 10px", fontSize: 12, color: "var(--muted)" }}>
              Thèmes éditoriaux auxquels se rattache cet événement.
            </p>
            <CheckboxMultiSelect
              idPrefix="theme"
              items={themes.map((t) => ({ id: t.id, label: t.title }))}
              selected={selectedThemes}
              onChange={setSelectedThemes}
            />
          </div>
        )}

        {/* Relations sous-thèmes */}
        {subThemes.length > 0 && (
          <div className="form-section">
            <p className="form-section-title">Sous-thèmes</p>
            <p style={{ margin: "0 0 10px", fontSize: 12, color: "var(--muted)" }}>
              Sous-thèmes traités par cet événement.
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

        {/* Relations projets */}
        {projects.length > 0 && (
          <div className="form-section">
            <p className="form-section-title">Projets</p>
            <p style={{ margin: "0 0 10px", fontSize: 12, color: "var(--muted)" }}>
              Projets dans le cadre desquels cet événement est organisé.
            </p>
            <CheckboxMultiSelect
              idPrefix="project"
              items={projects.map((p) => ({ id: p.id, label: p.title }))}
              selected={selectedProjects}
              onChange={setSelectedProjects}
            />
          </div>
        )}

        {/* Formats/techniques d'animation du répertoire */}
        {activityFormats.length > 0 && (
          <div className="form-section">
            <p className="form-section-title">Formats d&apos;activité</p>
            <p style={{ margin: "0 0 10px", fontSize: 12, color: "var(--muted)" }}>
              Techniques d&apos;animation utilisées (Fishbowl, Hot Takes...) — voir{" "}
              <a href="/admin/formatsactivites" target="_blank" rel="noreferrer" style={{ color: "var(--orange)" }}>
                le répertoire
              </a>
              . Facultatif, indépendant du format ci-dessus.
            </p>
            <CheckboxMultiSelect
              idPrefix="activity-format"
              items={activityFormats.map((f) => ({ id: f.id, label: f.title }))}
              selected={selectedFormats}
              onChange={setSelectedFormats}
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
          <Link href="/admin/evenements" className="button">
            Annuler
          </Link>
          <button type="submit" className="button primary" disabled={isPending}>
            {isPending ? "Enregistrement..." : isEdit ? "Mettre à jour" : "Créer l'événement"}
          </button>
        </div>
      </div>
    </form>
  );
}
