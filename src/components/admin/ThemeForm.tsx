"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { Theme } from "@/types/cms";
type ActionFn = (prevState: string | null, formData: FormData) => Promise<string | null>;

interface Props {
  initialData: Theme;
  action: ActionFn;
}

export function ThemeForm({ initialData, action }: Props) {
  const [error, formAction, isPending] = useActionState(action, null);

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

          <div className="form-field">
            <label className="field-label">Identifiant URL</label>
            <div className="slug-preview">/{initialData.slug}</div>
          </div>
        </div>

        <div className="form-section">
          <p className="form-section-title">Contenu éditorial</p>

          <div className="form-field">
            <label className="field-label">Description courte</label>
            <textarea
              name="description"
              defaultValue={initialData.description ?? ""}
              rows={4}
              placeholder="Accroche courte affichée sur la carte du thème (150 caractères max)..."
            />
          </div>

          <div className="form-field">
            <label className="field-label">Description longue</label>
            <textarea
              name="longDescription"
              defaultValue={initialData.longDescription ?? ""}
              rows={8}
              placeholder="Description complète du thème, affichée sur la page dédiée..."
            />
          </div>
        </div>

        <div className="form-section">
          <p className="form-section-title">Publication</p>
          <div className="form-row">
            <div className="form-field">
              <label className="field-label">Statut</label>
              <select name="status" defaultValue={initialData.status ?? "draft"}>
                <option value="draft">Brouillon</option>
                <option value="published">Publié</option>
                <option value="archived">Archivé</option>
              </select>
            </div>
            <div className="form-field" style={{ justifyContent: "flex-end" }}>
              <div className="form-checkbox">
                <input type="checkbox" id="featured" name="featured" defaultChecked={initialData.featured} />
                <label htmlFor="featured">Mettre en avant</label>
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <Link href="/admin/themes" className="button">
            Annuler
          </Link>
          <button type="submit" className="button primary" disabled={isPending}>
            {isPending ? "Enregistrement..." : "Mettre à jour le thème"}
          </button>
        </div>
      </div>
    </form>
  );
}
