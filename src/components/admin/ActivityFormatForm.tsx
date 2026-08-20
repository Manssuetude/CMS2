"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import type { ActivityFormat } from "@/types/cms";
import { ACTIVITY_FORMAT_ICON_LABELS } from "@/utils/activityFormatIcons";

type ActionFn = (prevState: string | null, formData: FormData) => Promise<string | null>;

function toSlug(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface Props {
  initialData?: ActivityFormat;
  action: ActionFn;
}

export function ActivityFormatForm({ initialData, action }: Props) {
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
          <p className="form-section-title">Informations</p>

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
              placeholder="Ex. : Fishbowl"
              onChange={(e) => {
                if (!isEdit) setSlug(toSlug(e.target.value));
              }}
            />
          </div>

          <div className="form-field">
            <label className="field-label" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              defaultValue={initialData?.description ?? ""}
              rows={4}
              placeholder="Comment se déroule ce format, en quelques phrases..."
            />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="field-label" htmlFor="icon">
                Icône
              </label>
              <select id="icon" name="icon" defaultValue={initialData?.icon ?? "discussion"}>
                {Object.entries(ACTIVITY_FORMAT_ICON_LABELS).map(([key, label]) => (
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
              <option value="draft">Brouillon</option>
              <option value="published">Publié</option>
              <option value="archived">Archivé</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <Link href="/admin/formatsactivites" className="button">
            Annuler
          </Link>
          <button type="submit" className="button primary" disabled={isPending}>
            {isPending ? "Enregistrement..." : isEdit ? "Mettre à jour" : "Créer le format"}
          </button>
        </div>
      </div>
    </form>
  );
}
