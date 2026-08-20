"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { Media, Theme } from "@/types/cms";

type ActionFn = (prevState: string | null, formData: FormData) => Promise<string | null>;

interface Props {
  item: Media;
  themes: Theme[];
  action: ActionFn;
}

export function MediaEditForm({ item, themes, action }: Props) {
  const [error, formAction, isPending] = useActionState(action, null);

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={item.id} />
      {error && <p className="form-error">{error}</p>}

      <div className="content-form">
        <div className="form-section">
          <p className="form-section-title">Informations générales</p>
          <div className="form-field">
            <label className="field-label" htmlFor="title">
              Titre *
            </label>
            <input id="title" type="text" name="title" defaultValue={item.title} required />
          </div>
          <div className="form-field">
            <label className="field-label" htmlFor="description">
              Description
            </label>
            <textarea id="description" name="description" defaultValue={item.description ?? ""} rows={3} />
          </div>
        </div>

        <div className="form-section">
          <p className="form-section-title">Référence bibliographique</p>
          <div className="form-row">
            <div className="form-field">
              <label className="field-label" htmlFor="author">
                Auteur
              </label>
              <input
                id="author"
                type="text"
                name="author"
                defaultValue={item.author ?? ""}
                placeholder="Nom de l'auteur·rice"
              />
            </div>
            <div className="form-field">
              <label className="field-label" htmlFor="institution">
                Institution
              </label>
              <input
                id="institution"
                type="text"
                name="institution"
                defaultValue={item.institution ?? ""}
                placeholder="Organisation, éditeur..."
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label className="field-label" htmlFor="publishedDate">
                Date de publication
              </label>
              <input
                id="publishedDate"
                type="date"
                name="publishedDate"
                defaultValue={item.publishedDate?.slice(0, 10) ?? ""}
              />
            </div>
            <div className="form-field">
              <label className="field-label" htmlFor="themeId">
                Thème associé
              </label>
              <select id="themeId" name="themeId" defaultValue={item.themeId ?? ""}>
                <option value="">Aucun</option>
                {themes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <p className="form-section-title">Affichage</p>
          <div className="form-field">
            <label className="field-label" htmlFor="alt">
              Texte alternatif
            </label>
            <input id="alt" type="text" name="alt" defaultValue={item.alt ?? ""} />
          </div>
          <div className="form-field">
            <label className="field-label" htmlFor="caption">
              Légende
            </label>
            <input id="caption" type="text" name="caption" defaultValue={item.caption ?? ""} />
          </div>
          <div className="form-row">
            <div className="form-field">
              <label className="field-label" htmlFor="tags">
                Tags
              </label>
              <input id="tags" type="text" name="tags" defaultValue={item.tags.join(", ")} placeholder="tag1, tag2" />
            </div>
            <div className="form-field">
              <label className="field-label" htmlFor="visibility">
                Visibilité
              </label>
              <select id="visibility" name="visibility" defaultValue={item.visibility}>
                <option value="draft">Brouillon</option>
                <option value="public">Public</option>
                <option value="private">Privé</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <Link href="/admin/media" className="button">
            Annuler
          </Link>
          <button type="submit" className="button primary" disabled={isPending}>
            {isPending ? "Enregistrement..." : "Mettre à jour"}
          </button>
        </div>
      </div>
    </form>
  );
}
