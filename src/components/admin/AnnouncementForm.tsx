"use client";

import { useActionState, useMemo, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { AlertTriangle, ExternalLink } from "lucide-react";
import { ImageCropField } from "@/components/media/ImageCropField";
import { HERO_ASPECT } from "@/constants/imageAspects";
import type { Announcement, Media } from "@/types/cms";
import {
  findOverlaps,
  formatParisDateTime,
  isoToParisLocal,
  parisLocalToIso,
  readAnnouncementForm,
  validateAnnouncement,
} from "@/utils/announcements";

type ActionFn = (prevState: string | null, formData: FormData) => Promise<string | null>;

function Section({
  title,
  hint,
  children,
  open = true,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
  open?: boolean;
}) {
  return (
    <details className="admin-collapsible" open={open}>
      <summary>{title}</summary>
      <div className="admin-collapsible-body">
        {hint ? <p className="admin-collapsible-hint">{hint}</p> : null}
        {children}
      </div>
    </details>
  );
}

function Field({
  name,
  label,
  defaultValue,
  placeholder,
  hint,
  textarea = false,
  required = false,
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  placeholder?: string;
  hint?: string;
  textarea?: boolean;
  required?: boolean;
}) {
  return (
    <div className="form-field">
      <label className="field-label" htmlFor={`ann-${name}`}>
        {label}
        {required ? " *" : ""}
      </label>
      {textarea ? (
        <textarea id={`ann-${name}`} name={name} rows={3} defaultValue={defaultValue ?? ""} placeholder={placeholder} />
      ) : (
        <input
          id={`ann-${name}`}
          type="text"
          name={name}
          defaultValue={defaultValue ?? ""}
          placeholder={placeholder}
          required={required}
        />
      )}
      {hint ? <p className="field-hint">{hint}</p> : null}
    </div>
  );
}

function Check({ name, label, defaultChecked }: { name: string; label: string; defaultChecked: boolean }) {
  return (
    <div className="form-checkbox">
      <input type="checkbox" id={`ann-${name}`} name={name} defaultChecked={defaultChecked} />
      <label htmlFor={`ann-${name}`}>{label}</label>
    </div>
  );
}

export function AnnouncementForm({
  initialData,
  others,
  images,
  action,
}: {
  initialData?: Announcement;
  // Autres annonces (avertissement de chevauchement).
  others: Announcement[];
  images: Media[];
  action: ActionFn;
}) {
  const a = initialData;
  const isEdit = Boolean(a);
  const [serverError, formAction, isPending] = useActionState(action, null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(a?.enabled ?? false);
  const [startsAt, setStartsAt] = useState(isoToParisLocal(a?.startsAt));
  const [endsAt, setEndsAt] = useState(isoToParisLocal(a?.endsAt));

  const overlaps = useMemo(
    () =>
      enabled
        ? findOverlaps(
            { id: a?.id ?? "", enabled, startsAt: parisLocalToIso(startsAt), endsAt: parisLocalToIso(endsAt) },
            others,
          )
        : [],
    [a?.id, enabled, startsAt, endsAt, others],
  );

  // Même validation que le serveur, avant l'envoi : on ne perd pas la saisie.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const error = validateAnnouncement(readAnnouncementForm(new FormData(event.currentTarget)));
    setClientError(error);
    if (error) {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  const error = clientError ?? serverError;

  return (
    <form action={formAction} onSubmit={handleSubmit} noValidate>
      {a ? <input type="hidden" name="id" value={a.id} /> : null}
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="content-form">
        <Section title="Dates et activation">
          <Field
            name="name"
            label="Nom interne"
            defaultValue={a?.name}
            placeholder="Recrutement nov.–déc. 2026"
            hint="Visible uniquement dans l'admin."
            required
          />
          <div className="form-row">
            <div className="form-field">
              <label className="field-label" htmlFor="ann-startsAt">
                Début (heure de Paris)
              </label>
              <input
                id="ann-startsAt"
                type="datetime-local"
                name="startsAt"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
              />
            </div>
            <div className="form-field">
              <label className="field-label" htmlFor="ann-endsAt">
                Fin (heure de Paris)
              </label>
              <input
                id="ann-endsAt"
                type="datetime-local"
                name="endsAt"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
              />
              <p className="field-hint">L&apos;annonce disparaît à cette heure (au plus une minute après).</p>
            </div>
          </div>
          <div className="form-checkbox">
            <input
              type="checkbox"
              id="ann-enabled"
              name="enabled"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
            />
            <label htmlFor="ann-enabled">Annonce activée (en ligne entre ces deux dates)</label>
          </div>
          {overlaps.length ? (
            <p className="admin-warning" role="status">
              <AlertTriangle size={15} strokeWidth={2} aria-hidden="true" />
              <span>
                Ces dates chevauchent une autre annonce activée :{" "}
                {overlaps.map((o) => `« ${o.name} » (jusqu'au ${formatParisDateTime(o.endsAt) ?? "?"})`).join(", ")}.
                Pendant le chevauchement, la plus récemment démarrée s&apos;affiche.
              </span>
            </p>
          ) : null}
        </Section>

        <Section
          title="Bandeau (toutes les pages)"
          hint="Barre sombre au-dessus du header. Écrivez {date} pour insérer la date de clôture. Masqué sur la page vers laquelle il pointe."
        >
          <Check name="bannerEnabled" label="Afficher le bandeau" defaultChecked={a?.bannerEnabled ?? true} />
          <div className="form-row">
            <Field
              name="bannerLabel"
              label="Libellé (en gras)"
              defaultValue={a?.bannerLabel}
              placeholder="Candidatures ouvertes"
            />
            <Field
              name="headerBadge"
              label="Badge sur « Rejoindre » (header)"
              defaultValue={a?.headerBadge}
              placeholder="OUVERT"
              hint="Vide = pas de badge."
            />
          </div>
          <Field
            name="bannerText"
            label="Texte"
            defaultValue={a?.bannerText}
            placeholder="Manssuétude recrute de nouveaux membres jusqu'au {date}."
          />
          <div className="form-row">
            <Field
              name="bannerLinkLabel"
              label="Texte du lien"
              defaultValue={a?.bannerLinkLabel}
              placeholder="Rejoindre Manssuétude →"
            />
            <Field name="bannerLinkUrl" label="Lien" defaultValue={a?.bannerLinkUrl} placeholder="/nous-rejoindre" />
          </div>
        </Section>

        <Section title="Hero de l'accueil" hint="Remplace le hero habituel de l'accueil pendant l'annonce.">
          <Check name="heroEnabled" label="Afficher le hero d'annonce" defaultChecked={a?.heroEnabled ?? true} />
          <Field name="eyebrow" label="Étiquette" defaultValue={a?.eyebrow} placeholder="CANDIDATURES OUVERTES" />
          <div className="form-row">
            <Field
              name="title"
              label="Titre"
              defaultValue={a?.title}
              placeholder="Manssuétude"
              hint="Obligatoire si le hero est affiché."
            />
            <Field
              name="titleAccent"
              label="Fin du titre en orange italique"
              defaultValue={a?.titleAccent}
              placeholder="recrute."
            />
          </div>
          <Field
            name="subtitle"
            label="Sous-titre"
            defaultValue={a?.subtitle}
            textarea
            placeholder="Un an pour poser les fondations. La suite, nous voulons la construire avec vous."
          />
          <div className="form-field">
            <ImageCropField
              label="Photo"
              name="imageId"
              cropName="imageCrop"
              images={images}
              defaultImageId={a?.imageId ?? ""}
              defaultCrop={a?.imageCrop ?? null}
              aspect={HERO_ASPECT}
            />
            <p className="field-hint">
              Le texte alternatif vient de la médiathèque. Elle sert aussi d&apos;image de partage de l&apos;accueil.
            </p>
          </div>
          <div className="form-row">
            <Field
              name="primaryCtaLabel"
              label="Bouton principal : texte"
              defaultValue={a?.primaryCtaLabel}
              placeholder="Candidater"
            />
            <Field
              name="primaryCtaUrl"
              label="Bouton principal : lien"
              defaultValue={a?.primaryCtaUrl}
              placeholder="https://forms.gle/…"
              hint="Un lien externe s'ouvre dans un nouvel onglet."
            />
          </div>
          <div className="form-row">
            <Field
              name="secondaryCtaLabel"
              label="Bouton secondaire : texte"
              defaultValue={a?.secondaryCtaLabel}
              placeholder="Pourquoi nous rejoindre"
            />
            <Field
              name="secondaryCtaUrl"
              label="Bouton secondaire : lien"
              defaultValue={a?.secondaryCtaUrl}
              placeholder="/nous-rejoindre"
            />
          </div>
          <Field
            name="periodLabel"
            label="Période"
            defaultValue={a?.periodLabel}
            placeholder="Campagne novembre – décembre 2026"
          />
          <Check
            name="showDeadline"
            label="Afficher « Clôture le [date de fin] »"
            defaultChecked={a?.showDeadline ?? true}
          />
          <Check
            name="showKeyFigures"
            label="Afficher la bande de chiffres clés sous le hero (réglés dans Page d'accueil)"
            defaultChecked={a?.showKeyFigures ?? true}
          />
        </Section>

        <Section
          title="Bloc final de l'accueil"
          hint="Bloc sombre qui remplace « Rejoindre une communauté… » en bas de l'accueil."
        >
          <Check name="finalEnabled" label="Afficher le bloc final" defaultChecked={a?.finalEnabled ?? true} />
          <Field
            name="finalEyebrow"
            label="Étiquette"
            defaultValue={a?.finalEyebrow}
            placeholder="REJOINDRE MANSSUÉTUDE"
          />
          <Field
            name="finalTitle"
            label="Titre"
            defaultValue={a?.finalTitle}
            placeholder="Il y a encore tant de questions à poser."
          />
          <Field name="finalText" label="Texte" defaultValue={a?.finalText} textarea />
          <div className="form-row">
            <Field
              name="finalCtaLabel"
              label="Bouton : texte"
              defaultValue={a?.finalCtaLabel}
              placeholder="Candidater"
            />
            <Field
              name="finalCtaUrl"
              label="Bouton : lien"
              defaultValue={a?.finalCtaUrl}
              placeholder="https://forms.gle/…"
            />
          </div>
        </Section>

        <Section
          title="Page Nous rejoindre"
          hint="Pendant l'annonce, /nous-rejoindre reprend l'étiquette, le titre, le sous-titre, le bouton principal et la date de clôture. À la fin, la page retrouve ses textes habituels, sans autre changement."
        >
          <Check
            name="appliesToJoinPage"
            label="Appliquer l'annonce à /nous-rejoindre"
            defaultChecked={a?.appliesToJoinPage ?? false}
          />
          <Field
            name="seoTitle"
            label="Titre SEO de /nous-rejoindre"
            defaultValue={a?.seoTitle}
            placeholder="Manssuétude recrute | Candidatures ouvertes"
            hint="Vide = titre + fin du titre + libellé du bandeau."
          />
          <Field
            name="seoDescription"
            label="Description SEO"
            defaultValue={a?.seoDescription}
            textarea
            hint="Vide = sous-titre de l'annonce."
          />
        </Section>

        <div className="form-actions">
          {a ? (
            <>
              <a className="button" href={`/?apercu-annonce=${a.id}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={14} strokeWidth={2} aria-hidden="true" /> Aperçu de l&apos;accueil
              </a>
              <a
                className="button"
                href={`/nous-rejoindre?apercu-annonce=${a.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink size={14} strokeWidth={2} aria-hidden="true" /> Aperçu de Nous rejoindre
              </a>
            </>
          ) : null}
          <Link href="/admin/annonces" className="button">
            Annuler
          </Link>
          <button type="submit" className="button primary" disabled={isPending}>
            {isPending ? "Enregistrement..." : isEdit ? "Enregistrer" : "Créer l'annonce"}
          </button>
        </div>
        {a ? (
          <p className="field-hint" style={{ textAlign: "right" }}>
            L&apos;aperçu montre la dernière version enregistrée.
          </p>
        ) : null}
      </div>
    </form>
  );
}
