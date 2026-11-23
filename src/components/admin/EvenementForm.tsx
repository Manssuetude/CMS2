"use client";

import { useActionState, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Eye, Plus, X } from "lucide-react";
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
import { SingleMediaField } from "@/components/media/SingleMediaField";
import { SortableMediaGallery } from "@/components/media/SortableMediaGallery";
import { EventHeaderStyleField } from "@/components/admin/EventHeaderStyleField";
import { EventPreviewModal } from "@/components/admin/EventPreviewModal";
import { AdminFormBar } from "@/components/admin/AdminFormBar";
import { FormTabPanel, FormTabs, type FormTab } from "@/components/admin/FormTabs";
import { ThemeTreePicker } from "@/components/admin/ThemeTreePicker";
import { ChipPicker } from "@/components/admin/ChipPicker";
import { SeoFields } from "@/components/admin/SeoFields";
import { eventFormatLabel } from "@/utils/eventLabels";
import { bannerWarning, type HeaderStyle } from "@/utils/eventHeader";
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

const TABS: FormTab[] = [
  { id: "essentiel", label: "Essentiel" },
  { id: "description", label: "Description" },
  { id: "intervenants", label: "Intervenants" },
  { id: "photos", label: "Affiche et photos" },
  { id: "liens", label: "Thèmes et liens" },
  { id: "referencement", label: "Référencement" },
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
  /** Thèmes archivés non proposés (voir themeRepository.listSelectableThemes). */
  archivedHiddenCount?: number;
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
  archivedHiddenCount = 0,
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
  const [error, formAction] = useActionState(action, null);
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [body, setBody] = useState(initialData?.body ?? "");
  const [speakers, setSpeakers] = useState<Speaker[]>(initialData?.speakers ?? []);
  const [selectedThemes, setSelectedThemes] = useState<string[]>(initialThemeIds);
  const [selectedSubThemes, setSelectedSubThemes] = useState<string[]>(initialSubThemeIds);
  const [selectedProjects, setSelectedProjects] = useState<string[]>(initialProjectIds);
  const [selectedFormats, setSelectedFormats] = useState<string[]>(initialFormatIds);
  const [animators, setAnimators] = useState<EventAnimator[]>(initialAnimators);
  const formRef = useRef<HTMLFormElement>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [headerStyle, setHeaderStyle] = useState<HeaderStyle>(initialData?.headerStyle ?? "classic");
  const [posterMedia, setPosterMedia] = useState<Media | null>(
    images.find((m) => m.id === initialData?.posterId) ?? null,
  );
  const [galleryMedia, setGalleryMedia] = useState<Media[]>(
    (initialData?.gallery ?? []).flatMap((id) => images.filter((m) => m.id === id)),
  );
  // Même règle que la page publique : la bannière utilise la 1re photo de la
  // galerie, l'affiche étant exclue (jamais en fond de bannière).
  const headerWarning = bannerWarning(galleryMedia.filter((m) => m.id !== posterMedia?.id));
  const mentionItems = useMemo(() => activityFormats.map((f) => ({ id: f.id, title: f.title })), [activityFormats]);

  function updateSpeaker(index: number, field: keyof Speaker, value: string) {
    setSpeakers((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  }

  function updateAnimator(index: number, field: keyof EventAnimator, value: string) {
    setAnimators((prev) => prev.map((a, i) => (i === index ? { ...a, [field]: value } : a)));
  }

  return (
    <form action={formAction} ref={formRef}>
      {isEdit && <input type="hidden" name="id" value={initialData.id} />}
      {!isEdit && <input type="hidden" name="slug" value={slug} />}
      <input type="hidden" name="body" value={body} />
      <input type="hidden" name="speakers" value={JSON.stringify(speakers.filter((s) => s.name.trim()))} />
      <input type="hidden" name="themeIds" value={selectedThemes.join(",")} />
      <input type="hidden" name="subThemeIds" value={selectedSubThemes.join(",")} />
      <input type="hidden" name="projectIds" value={selectedProjects.join(",")} />
      <input type="hidden" name="formatIds" value={selectedFormats.join(",")} />
      <input type="hidden" name="animators" value={JSON.stringify(animators.filter((a) => a.authorId))} />

      {error && <p className="form-error">{error}</p>}

      <FormTabs tabs={TABS}>
        <FormTabPanel id="essentiel">
          <div className="fiche-grid">
            <div className="form-section">
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
                      Choisir un format…
                    </option>
                    {FORMATS.map((f) => (
                      <option key={f} value={f}>
                        {eventFormatLabel(f)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-field">
                  <label className="field-label" htmlFor="location">
                    Lieu
                  </label>
                  <input
                    id="location"
                    type="text"
                    name="location"
                    defaultValue={initialData?.location ?? ""}
                    placeholder="Ex. : 12 rue de la République, Paris"
                  />
                </div>
              </div>
              <div className="form-row form-row-3">
                <div className="form-field">
                  <label className="field-label" htmlFor="date">
                    Date
                  </label>
                  <input id="date" type="date" name="date" defaultValue={initialData?.date?.slice(0, 10) ?? ""} />
                </div>
                <div className="form-field">
                  <label className="field-label" htmlFor="startTime">
                    Début
                  </label>
                  <input id="startTime" type="time" name="startTime" defaultValue={initialData?.startTime ?? ""} />
                </div>
                <div className="form-field">
                  <label className="field-label" htmlFor="endTime">
                    Fin
                  </label>
                  <input id="endTime" type="time" name="endTime" defaultValue={initialData?.endTime ?? ""} />
                </div>
              </div>
              <div className="form-field">
                <label className="field-label" htmlFor="description">
                  Résumé court
                </label>
                <textarea
                  id="description"
                  name="description"
                  defaultValue={initialData?.description ?? ""}
                  rows={3}
                  placeholder="Pour les listes et le référencement…"
                />
              </div>
            </div>

            <div className="form-section">
              <p className="form-section-title">Inscriptions</p>
              <div className="form-field">
                <label className="field-label" htmlFor="registrationStatus">
                  État
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
              <div className="form-field">
                <label className="field-label" htmlFor="eventbriteUrl">
                  Lien d&apos;inscription
                </label>
                <input
                  id="eventbriteUrl"
                  type="url"
                  name="eventbriteUrl"
                  defaultValue={initialData?.eventbriteUrl ?? ""}
                  placeholder="https://…"
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
                  placeholder="Nombre de places"
                />
              </div>
            </div>
          </div>
        </FormTabPanel>

        <FormTabPanel id="description">
          <div className="content-form">
            <div className="form-section">
              <p className="form-section-title">Description</p>
              {mentionItems.length > 0 && (
                <p className="field-hint" style={{ margin: "0 0 10px" }}>
                  Tapez <code>#</code> dans le texte pour insérer un repère cliquable vers un format d&apos;activité (sa
                  description s&apos;affiche en bulle sur le site, sans avoir à la recopier ici).
                </p>
              )}
              <RichTextEditor value={body} onChange={setBody} mentionItems={mentionItems} />
            </div>
            <div className="form-section">
              <div className="form-field" style={{ maxWidth: 320 }}>
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
        </FormTabPanel>

        <FormTabPanel id="intervenants">
          <div className="content-form">
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
          </div>
        </FormTabPanel>

        <FormTabPanel id="photos">
          <div className="content-form">
            {/* Affiche et en-tête : image principale (une seule, jamais recadrée
            si c'est une affiche) et style d'en-tête de la page publique. */}
            <div className="form-section">
              <p className="form-section-title">Affiche et en-tête</p>
              <p style={{ margin: "0 0 10px", fontSize: 12, color: "var(--muted)" }}>
                Image affichée en haut de la page et utilisée pour le partage sur les réseaux.
              </p>
              <SingleMediaField
                name="posterId"
                initialMedia={images}
                initialSelectedId={initialData?.posterId ?? null}
                buttonLabel="Choisir l'image principale"
                onChange={setPosterMedia}
              />
              <EventHeaderStyleField value={headerStyle} onChange={setHeaderStyle} warning={headerWarning} />
            </div>

            {/* Compte-rendu en images (n'apparaît côté public que si l'événement est
            passé ou terminé, et seulement si des images sont ajoutées ici) */}
            <div className="form-section">
              <p className="form-section-title">Compte-rendu en images</p>
              <p style={{ margin: "0 0 10px", fontSize: 12, color: "var(--muted)" }}>
                Photos affichées sur la page publique une fois l&apos;événement passé ou marqué « Terminé ».
              </p>
              <SortableMediaGallery
                name="gallery"
                initialMedia={images}
                initialSelectedIds={initialData?.gallery ?? []}
                onChange={setGalleryMedia}
              />
            </div>
          </div>
        </FormTabPanel>

        <FormTabPanel id="liens">
          <div className="fiche-grid">
            <div className="form-section">
              <ThemeTreePicker
                themes={themes}
                subThemes={subThemes}
                archivedHiddenCount={archivedHiddenCount}
                selectedThemeIds={selectedThemes}
                onThemesChange={setSelectedThemes}
                selectedSubThemeIds={selectedSubThemes}
                onSubThemesChange={setSelectedSubThemes}
              />
            </div>
            <div className="fiche-side">
              <div className="form-section">
                <p className="form-section-title">Formats d&apos;activité</p>
                {activityFormats.length > 0 ? (
                  <ChipPicker
                    items={activityFormats.map((f) => ({ id: f.id, label: f.title }))}
                    selected={selectedFormats}
                    onChange={setSelectedFormats}
                  />
                ) : (
                  <p className="field-hint">Aucun format dans le répertoire.</p>
                )}
                <p className="field-hint" style={{ marginTop: 10 }}>
                  Techniques d&apos;animation (Fishbowl, Hot Takes…), indépendantes du format de l&apos;événement.
                </p>
              </div>
              {projects.length > 0 && (
                <div className="form-section">
                  <p className="form-section-title">Projet lié</p>
                  <CheckboxMultiSelect
                    idPrefix="project"
                    items={projects.map((p) => ({
                      id: p.id,
                      label: p.status === "draft" ? `${p.title} (brouillon)` : p.title,
                    }))}
                    selected={selectedProjects}
                    onChange={setSelectedProjects}
                  />
                </div>
              )}
            </div>
          </div>
        </FormTabPanel>

        <FormTabPanel id="referencement">
          <div className="content-form">
            <div className="form-section">
              <SeoFields
                defaultTitle={initialData?.seoTitle}
                defaultDescription={initialData?.seoDescription}
                fallbackTitle={initialData?.title}
                fallbackDescription={initialData?.description}
                path={initialData ? `/evenements/${initialData.slug}` : null}
              />
            </div>
          </div>
        </FormTabPanel>
      </FormTabs>

      <AdminFormBar
        status={{ defaultValue: initialData?.status ?? "draft" }}
        error={error}
        isNew={!isEdit}
        submitLabel={isEdit ? "Enregistrer" : "Créer l'événement"}
        actions={
          <button type="button" className="button" onClick={() => setPreviewOpen(true)}>
            <Eye size={15} strokeWidth={1.75} aria-hidden="true" />
            Aperçu
          </button>
        }
      />
      {previewOpen && (
        <EventPreviewModal
          formRef={formRef}
          headerStyle={headerStyle}
          onHeaderStyleChange={setHeaderStyle}
          onClose={() => setPreviewOpen(false)}
          onSave={() => {
            setPreviewOpen(false);
            formRef.current?.requestSubmit();
          }}
        />
      )}
    </form>
  );
}
