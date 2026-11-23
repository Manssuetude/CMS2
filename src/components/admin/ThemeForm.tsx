"use client";

import { useActionState } from "react";
import { AdminFormBar } from "@/components/admin/AdminFormBar";
import type { Theme } from "@/types/cms";
type ActionFn = (prevState: string | null, formData: FormData) => Promise<string | null>;

interface Props {
  initialData: Theme;
  action: ActionFn;
}

export function ThemeForm({ initialData, action }: Props) {
  const [error, formAction] = useActionState(action, null);

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={initialData.id} />

      {error && <p className="form-error">{error}</p>}

      <div className="content-form">
        <div className="form-section">
          <p className="form-section-title">Identité du thème</p>

          <div className="form-field">
            <label className="field-label">Titre (fixe)</label>
            <div className="slug-preview" style={{ fontSize: 14, color: "var(--ink)" }}>
              {initialData.title}
            </div>
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
              defaultValue={initialData.description ?? ""}
              rows={4}
              placeholder="Accroche courte affichée sur la carte du thème (150 caractères max)..."
            />
          </div>

          <div className="form-field">
            <label className="field-label" htmlFor="longDescription">
              Description longue
            </label>
            <textarea
              id="longDescription"
              name="longDescription"
              defaultValue={initialData.longDescription ?? ""}
              rows={8}
              placeholder="Description complète du thème, affichée sur la page dédiée..."
            />
          </div>
        </div>

        <div className="form-section">
          <p className="form-section-title">SEO</p>
          <div className="form-field">
            <label className="field-label" htmlFor="seoTitle">
              Titre SEO (onglet navigateur)
            </label>
            <input
              id="seoTitle"
              name="seoTitle"
              defaultValue={initialData.seoTitle ?? ""}
              placeholder={initialData.title}
            />
          </div>
          <div className="form-field">
            <label className="field-label" htmlFor="seoDescription">
              Description SEO
            </label>
            <textarea
              id="seoDescription"
              name="seoDescription"
              defaultValue={initialData.seoDescription ?? ""}
              rows={3}
              placeholder={initialData.description ?? ""}
            />
          </div>
        </div>

        <div className="form-section">
          <p className="form-section-title">Mise en avant</p>
          <div className="form-checkbox">
            <input type="checkbox" id="featured" name="featured" defaultChecked={initialData.featured} />
            <label htmlFor="featured">Mettre en avant</label>
          </div>
        </div>
      </div>

      <AdminFormBar status={{ defaultValue: initialData.status ?? "draft" }} error={error} />
    </form>
  );
}
