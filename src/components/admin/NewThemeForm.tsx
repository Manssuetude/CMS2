"use client";

import { useActionState } from "react";
import Link from "next/link";

type ActionFn = (prevState: string | null, formData: FormData) => Promise<string | null>;

interface Props {
  action: ActionFn;
}

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function NewThemeForm({ action }: Props) {
  const [error, formAction, isPending] = useActionState(action, null);

  return (
    <form action={formAction}>
      {error && <p className="form-error">{error}</p>}

      <div className="content-form">
        <div className="form-section">
          <p className="form-section-title">Identité du thème</p>

          <div className="form-field">
            <label className="field-label" htmlFor="title">
              Titre <span style={{ color: "var(--orange)" }}>*</span>
            </label>
            <input
              id="title"
              name="title"
              required
              placeholder="ex. Transitions écologiques"
              onChange={(e) => {
                const slugInput = e.currentTarget.form?.elements.namedItem("slug") as HTMLInputElement | null;
                if (slugInput && !slugInput.dataset.manual) {
                  slugInput.value = toSlug(e.currentTarget.value);
                }
              }}
            />
          </div>

          <div className="form-field">
            <label className="field-label" htmlFor="slug">
              Identifiant URL <span style={{ color: "var(--orange)" }}>*</span>
            </label>
            <input
              id="slug"
              name="slug"
              required
              placeholder="transitions-ecologiques"
              pattern="[a-z0-9-]+"
              onChange={(e) => {
                e.currentTarget.dataset.manual = "1";
              }}
            />
            <span className="field-hint">Minuscules, chiffres et tirets uniquement. Définitif après création.</span>
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
              rows={4}
              placeholder="Accroche courte affichée sur la carte du thème (150 caractères max)…"
            />
          </div>

          <div className="form-field">
            <label className="field-label" htmlFor="longDescription">
              Description longue
            </label>
            <textarea
              id="longDescription"
              name="longDescription"
              rows={8}
              placeholder="Description complète du thème, affichée sur la page dédiée…"
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
              <select id="status" name="status" defaultValue="draft">
                <option value="draft">Brouillon</option>
                <option value="published">Publié</option>
                <option value="archived">Archivé</option>
              </select>
            </div>
            <div className="form-field" style={{ justifyContent: "flex-end" }}>
              <div className="form-checkbox">
                <input type="checkbox" id="featured" name="featured" />
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
            {isPending ? "Création…" : "Créer le thème"}
          </button>
        </div>
      </div>
    </form>
  );
}
