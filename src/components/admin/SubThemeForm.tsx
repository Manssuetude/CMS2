"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import type { SubTheme, Theme } from "@/types/cms";

type ActionFn = (prevState: string | null, formData: FormData) => Promise<string | null>;

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface Props {
  initialData?: SubTheme;
  action: ActionFn;
  themes: Theme[];
}

export function SubThemeForm({ initialData, action, themes }: Props) {
  const isEdit = !!initialData;
  const [error, formAction, isPending] = useActionState(action, null);
  const [slug, setSlug] = useState(initialData?.slug ?? "");

  return (
    <form action={formAction}>
      {isEdit && <input type="hidden" name="id" value={initialData.id} />}
      {!isEdit && <input type="hidden" name="slug" value={slug} />}

      {error && <p className="form-error">{error}</p>}

      <div className="content-form">
        <div className="form-section">
          <p className="form-section-title">Identité du sous-thème</p>

          {isEdit ? (
            <div className="form-field">
              <label className="field-label" htmlFor="title">
                Titre <span style={{ color: "var(--orange)" }}>*</span>
              </label>
              <input id="title" name="title" required defaultValue={initialData.title} />
            </div>
          ) : (
            <div className="form-field">
              <label className="field-label" htmlFor="title">
                Titre <span style={{ color: "var(--orange)" }}>*</span>
              </label>
              <input
                id="title"
                name="title"
                required
                placeholder="ex. Sobriété énergétique"
                onChange={(e) => setSlug(toSlug(e.target.value))}
              />
            </div>
          )}

          <div className="form-field">
            <label className="field-label" htmlFor="themeId">
              Thème parent <span style={{ color: "var(--orange)" }}>*</span>
            </label>
            <select id="themeId" name="themeId" defaultValue={initialData?.themeId ?? ""} required>
              <option value="" disabled>
                Choisir un thème...
              </option>
              {themes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-section">
          <p className="form-section-title">Contenu éditorial</p>

          <div className="form-field">
            <label className="field-label" htmlFor="description">
              Description courte
            </label>
            <textarea
              id="description"
              name="description"
              defaultValue={initialData?.description ?? ""}
              rows={4}
              placeholder="Accroche courte affichée sur la carte du sous-thème (150 caractères max)..."
            />
          </div>

          <div className="form-field">
            <label className="field-label" htmlFor="longDescription">
              Description longue
            </label>
            <textarea
              id="longDescription"
              name="longDescription"
              defaultValue={initialData?.longDescription ?? ""}
              rows={8}
              placeholder="Description complète du sous-thème, affichée sur la page dédiée..."
            />
          </div>

          <div className="form-field" style={{ maxWidth: 280 }}>
            <label className="field-label" htmlFor="date">
              Sujet traité le
            </label>
            <input id="date" type="date" name="date" defaultValue={initialData?.date?.slice(0, 10) ?? ""} />
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
          <Link href="/admin/sousthemes" className="button">
            Annuler
          </Link>
          <button type="submit" className="button primary" disabled={isPending}>
            {isPending ? "Enregistrement..." : isEdit ? "Mettre à jour" : "Créer le sous-thème"}
          </button>
        </div>
      </div>
    </form>
  );
}
