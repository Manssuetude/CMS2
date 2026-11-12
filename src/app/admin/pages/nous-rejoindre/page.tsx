import Link from "next/link";
import type { ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import { requirePermission } from "@/lib/auth";
import { pageRepository } from "@/repositories/pageRepository";
import { mediaRepository } from "@/repositories/mediaRepository";
import { ImageCropField } from "@/components/media/ImageCropField";
import { JOIN_BANNER_ASPECT, JOIN_START_ASPECT, PORTRAIT_ASPECT } from "@/constants/imageAspects";
import { JOIN_FALLBACK } from "@/constants/joinPage";
import type { Media, SlotPhoto } from "@/types/cms";
import { parseJoinPageContent } from "@/utils/joinPage";
import { saveJoinPageAction } from "../actions";

// Éditeur dédié de /nous-rejoindre (comme /admin/homepage) : tous les textes
// et toutes les photos de la page. Les textes par défaut sont préremplis.

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <details className="admin-collapsible" open>
      <summary>{title}</summary>
      <div className="admin-collapsible-body">
        {hint ? <p className="admin-collapsible-hint">{hint}</p> : null}
        {children}
      </div>
    </details>
  );
}

function Text({
  name,
  label,
  value,
  textarea = false,
  hint,
}: {
  name: string;
  label: string;
  value: string | null | undefined;
  textarea?: boolean;
  hint?: string;
}) {
  const id = `join-${name.replace(/\./g, "-")}`;
  return (
    <div className="form-field">
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      {textarea ? (
        <textarea id={id} name={name} rows={3} defaultValue={value ?? ""} />
      ) : (
        <input id={id} type="text" name={name} defaultValue={value ?? ""} />
      )}
      {hint ? <p className="field-hint">{hint}</p> : null}
    </div>
  );
}

function Photo({
  prefix,
  label,
  photo,
  images,
  aspect,
}: {
  prefix: string;
  label: string;
  photo: SlotPhoto;
  images: Media[];
  aspect: number;
}) {
  return (
    <>
      <div className="form-field">
        <ImageCropField
          label={label}
          name={`${prefix}.imageId`}
          cropName={`${prefix}.crop`}
          images={images}
          defaultImageId={photo.imageId ?? ""}
          defaultCrop={photo.crop}
          aspect={aspect}
        />
      </div>
      <Text name={`${prefix}.alt`} label="Texte alternatif (description de la photo)" value={photo.alt} />
    </>
  );
}

export default async function EditJoinPage() {
  await requirePermission("pages:edit");
  const [page, media] = await Promise.all([pageRepository.getPage("nous-rejoindre"), mediaRepository.list()]);
  const images = media.filter((m) => m.type === "image");
  const c = parseJoinPageContent(page?.content);

  return (
    <section className="admin-panel">
      <div className="admin-page-header">
        <div>
          <Link href="/admin/pages" className="btn-sm" style={{ marginBottom: 10 }}>
            ← Toutes les pages
          </Link>
          <h1>Modifier : Nous rejoindre</h1>
          <p>
            Textes et photos de la page, section par section. Pendant une annonce appliquée à la page, l&apos;étiquette,
            le titre, le sous-titre et le bouton sont remplacés par ceux de l&apos;annonce (voir Annonces).
          </p>
        </div>
        <a href="/nous-rejoindre" target="_blank" rel="noreferrer" className="btn-sm">
          <ExternalLink size={13} strokeWidth={2} />
          Voir le rendu final
        </a>
      </div>

      <form action={saveJoinPageAction} className="content-form">
        <Section title="1. Hero">
          <Text name="eyebrow" label="Étiquette" value={page?.eyebrow ?? JOIN_FALLBACK.eyebrow} />
          <Text name="title" label="Titre" value={page?.title ?? JOIN_FALLBACK.title} />
          <Text name="heroSubtitle" label="Sous-titre" value={c.heroSubtitle} textarea />
          <div className="form-row">
            <Text
              name="primary_cta_label"
              label="Bouton : texte"
              value={page?.primaryCtaLabel ?? JOIN_FALLBACK.ctaLabel}
            />
            <Text
              name="primary_cta_target"
              label="Bouton : cible"
              value={page?.primaryCtaTarget ?? JOIN_FALLBACK.ctaTarget}
              hint="memberApplication = formulaire d'adhésion du site, ou un lien (/… ou https://…)."
            />
          </div>
          <div className="form-field">
            <ImageCropField
              label="Photo principale (bandeau pleine largeur)"
              name="image_id"
              cropName="image_crop"
              images={images}
              defaultImageId={page?.imageId ?? ""}
              defaultCrop={page?.imageCrop ?? null}
              aspect={JOIN_BANNER_ASPECT}
            />
          </div>
          <Text name="heroAlt" label="Texte alternatif de la photo principale" value={c.heroAlt} />
        </Section>

        <Section title="2. Notre point de départ">
          <Text name="start.eyebrow" label="Étiquette" value={c.start.eyebrow} />
          <Text name="start.title" label="Titre" value={c.start.title} />
          <Text name="start.text" label="Texte" value={c.start.text} textarea />
          <Photo
            prefix="start.photo"
            label="Photo (à droite)"
            photo={c.start.photo}
            images={images}
            aspect={JOIN_START_ASPECT}
          />
        </Section>

        <Section title="3. Chiffres clés">
          <p className="admin-collapsible-hint" style={{ margin: 0 }}>
            Les chiffres sont communs à l&apos;accueil et à cette page :{" "}
            <Link href="/admin/homepage" style={{ color: "var(--orange)" }}>
              les modifier dans Page d&apos;accueil →
            </Link>
          </p>
        </Section>

        <Section title="4. Une expérience collective">
          <Text name="experience.eyebrow" label="Étiquette" value={c.experience.eyebrow} />
          <Text name="experience.title" label="Titre" value={c.experience.title} />
          <Text name="experience.text" label="Texte" value={c.experience.text} textarea />
          {c.experience.items.map((item, i) => (
            <div key={i}>
              <p className="admin-collapsible-sub">Photo {i + 1}</p>
              <Text name={`experience.items.${i}.label`} label="Légende" value={item.label} />
              <Photo
                prefix={`experience.items.${i}.photo`}
                label="Photo verticale"
                photo={item.photo}
                images={images}
                aspect={PORTRAIT_ASPECT}
              />
            </div>
          ))}
        </Section>

        <Section title="5. Le cap que nous nous donnons (fond sombre)">
          <Text name="ambition.eyebrow" label="Étiquette" value={c.ambition.eyebrow} />
          <Text name="ambition.title" label="Titre" value={c.ambition.title} />
          <Text name="ambition.text" label="Texte" value={c.ambition.text} textarea />
          {c.ambition.items.map((item, i) => (
            <div className="form-row" key={i}>
              <Text name={`ambition.items.${i}.title`} label={`0${i + 1} : titre`} value={item.title} />
              <Text name={`ambition.items.${i}.text`} label={`0${i + 1} : complément`} value={item.text} />
            </div>
          ))}
        </Section>

        <Section title="6. Pour qui ? Qu'attendons-nous ?">
          <Text name="audience.eyebrow" label="Étiquette" value={c.audience.eyebrow} />
          <Text name="audience.title" label="Titre" value={c.audience.title} />
          <div className="form-row">
            <Text name="audience.whoTitle" label="Colonne 1 : titre" value={c.audience.whoTitle} />
            <Text name="audience.expectTitle" label="Colonne 2 : titre" value={c.audience.expectTitle} />
          </div>
          <div className="form-row">
            <Text name="audience.whoText" label="Colonne 1 : texte" value={c.audience.whoText} textarea />
            <Text name="audience.expectText" label="Colonne 2 : texte" value={c.audience.expectText} textarea />
          </div>
          <Text
            name="audience.qualities"
            label="Qualités attendues (pastilles)"
            value={c.audience.qualities.join(", ")}
            hint="Séparées par des virgules."
          />
        </Section>

        <Section title="7. Comment rejoindre ?">
          <Text name="steps.eyebrow" label="Étiquette" value={c.steps.eyebrow} />
          <Text name="steps.title" label="Titre" value={c.steps.title} />
          {c.steps.items.map((step, i) => (
            <div className="form-row" key={i}>
              <Text name={`steps.items.${i}.title`} label={`Étape ${i + 1} : titre`} value={step.title} />
              <Text name={`steps.items.${i}.text`} label={`Étape ${i + 1} : texte`} value={step.text} textarea />
            </div>
          ))}
          <Text name="steps.note" label="Phrase sur l'engagement bénévole" value={c.steps.note} textarea />
        </Section>

        <Section title="8. Rejoindre (bas de page, ancre #candidater)" hint="Le bouton reprend celui du hero.">
          <Text name="final.eyebrow" label="Étiquette" value={c.final.eyebrow} />
          <Text name="final.title" label="Titre" value={c.final.title} />
          <Text name="final.text" label="Texte" value={c.final.text} textarea />
          <Photo
            prefix="final.photo"
            label="Photo (à gauche)"
            photo={c.final.photo}
            images={images}
            aspect={PORTRAIT_ASPECT}
          />
        </Section>

        <Section
          title="SEO"
          hint="Hors annonce. Pendant une annonce appliquée à la page, le SEO de l'annonce s'applique."
        >
          <Text name="seo_title" label="Titre SEO" value={page?.seoTitle} />
          <Text name="seo_description" label="Description SEO" value={page?.seoDescription} textarea />
        </Section>

        <div className="form-actions">
          <button type="submit" className="button primary">
            Enregistrer les modifications
          </button>
        </div>
      </form>
    </section>
  );
}
