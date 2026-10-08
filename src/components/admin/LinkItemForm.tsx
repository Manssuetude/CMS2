"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { LinkItem } from "@/types/cms";
import { LINK_ICON_LABELS } from "@/utils/linkIcons";

type ActionFn = (prevState: string | null, formData: FormData) => Promise<string | null>;

interface Props {
  initialData?: LinkItem;
  action: ActionFn;
}

export function LinkItemForm({ initialData, action }: Props) {
  const isEdit = !!initialData;
  const [error, formAction, isPending] = useActionState(action, null);

  return (
    <form action={formAction}>
      {isEdit && <input type="hidden" name="id" value={initialData.id} />}

      {error && <p className="form-error">{error}</p>}

      <div className="content-form">
        <div className="form-section">
          <p className="form-section-title">Informations</p>

          <div className="form-field">
            <label className="field-label" htmlFor="label">
              Libellé *
            </label>
            <input
              id="label"
              type="text"
              name="label"
              defaultValue={initialData?.label}
              required
              placeholder="Ex. : Instagram"
            />
          </div>

          <div className="form-field">
            <label className="field-label" htmlFor="url">
              URL *
            </label>
            <input id="url" type="url" name="url" defaultValue={initialData?.url} required placeholder="https://..." />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="field-label" htmlFor="icon">
                Icône
              </label>
              <select id="icon" name="icon" defaultValue={initialData?.icon ?? "link"}>
                {Object.entries(LINK_ICON_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label className="field-label" htmlFor="position">
                Ordre d&apos;affichage
              </label>
              <input id="position" type="number" name="position" defaultValue={initialData?.position ?? 0} min={0} />
            </div>
          </div>

          <div className="form-field" style={{ maxWidth: 280 }}>
            <label className="field-label" htmlFor="status">
              Statut
            </label>
            <select id="status" name="status" defaultValue={initialData?.status ?? "draft"}>
              <option value="draft">Brouillon (masqué sur /link)</option>
              <option value="published">Publié</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <Link href="/admin/links" className="button">
            Annuler
          </Link>
          <button type="submit" className="button primary" disabled={isPending}>
            {isPending ? "Enregistrement..." : isEdit ? "Mettre à jour" : "Créer le lien"}
          </button>
        </div>
      </div>
    </form>
  );
}
