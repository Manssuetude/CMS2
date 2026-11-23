"use client";

import { useState } from "react";
import { SITE_URL } from "@/constants/site";

// Onglet « Référencement » : titre (60 caractères au maximum conseillés, avec
// compteur), description, et aperçu du résultat dans Google.

export const SEO_TITLE_MAX = 60;
export const SEO_DESCRIPTION_MAX = 160;

interface Props {
  defaultTitle?: string | null;
  defaultDescription?: string | null;
  /** Repli quand le champ est vide (titre / résumé du contenu). */
  fallbackTitle?: string | null;
  fallbackDescription?: string | null;
  /** Chemin public de la page (ex. /evenements/mon-evenement). */
  path?: string | null;
}

export function SeoFields({ defaultTitle, defaultDescription, fallbackTitle, fallbackDescription, path }: Props) {
  const [title, setTitle] = useState(defaultTitle ?? "");
  const [description, setDescription] = useState(defaultDescription ?? "");
  const shownTitle = (title.trim() || fallbackTitle || "Titre de la page").trim();
  const shownDescription = (description.trim() || fallbackDescription || "").trim();
  const tooLong = title.length > SEO_TITLE_MAX;
  const host = SITE_URL.replace(/^https?:\/\//, "");

  return (
    <div className="seo-fields">
      <div className="form-field">
        <div className="seo-field-head">
          <label className="field-label" htmlFor="seoTitle">
            Titre dans Google et l&apos;onglet du navigateur
          </label>
          <span className={`seo-counter${tooLong ? " is-over" : ""}`} aria-live="polite">
            {title.length} / {SEO_TITLE_MAX}
          </span>
        </div>
        <input
          id="seoTitle"
          name="seoTitle"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={fallbackTitle ?? ""}
          aria-describedby="seoTitle-hint"
        />
        <p id="seoTitle-hint" className={`field-hint${tooLong ? " is-over" : ""}`}>
          {tooLong
            ? "Trop long : Google coupera le titre. Visez 60 caractères au maximum."
            : "Vide = titre du contenu. 60 caractères au maximum."}
        </p>
      </div>
      <div className="form-field">
        <div className="seo-field-head">
          <label className="field-label" htmlFor="seoDescription">
            Description dans Google
          </label>
          <span className={`seo-counter${description.length > SEO_DESCRIPTION_MAX ? " is-over" : ""}`}>
            {description.length} / {SEO_DESCRIPTION_MAX}
          </span>
        </div>
        <textarea
          id="seoDescription"
          name="seoDescription"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={fallbackDescription ?? ""}
        />
      </div>
      <div className="seo-preview" aria-label="Aperçu du résultat dans Google">
        <p className="seo-preview-label">Aperçu dans Google</p>
        <p className="seo-preview-url">
          {host}
          {path ? ` › ${path.replace(/^\//, "").split("/").join(" › ")}` : ""}
        </p>
        <p className="seo-preview-title">
          {shownTitle.length > SEO_TITLE_MAX ? `${shownTitle.slice(0, SEO_TITLE_MAX - 1)}…` : shownTitle} | Manssuétude
        </p>
        <p className="seo-preview-description">
          {shownDescription
            ? shownDescription.length > SEO_DESCRIPTION_MAX
              ? `${shownDescription.slice(0, SEO_DESCRIPTION_MAX - 1)}…`
              : shownDescription
            : "Ajoutez une description pour maîtriser le texte affiché sous le titre."}
        </p>
      </div>
    </div>
  );
}
