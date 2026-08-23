"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { Author, Media } from "@/types/cms";

type ActionFn = (prevState: string | null, formData: FormData) => Promise<string | null>;

interface Props {
  initialData?: Author;
  action: ActionFn;
  images: Media[];
}

export function AuthorForm({ initialData, action, images }: Props) {
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
            <label className="field-label" htmlFor="name">
              Nom *
            </label>
            <input
              id="name"
              type="text"
              name="name"
              defaultValue={initialData?.name}
              required
              placeholder="Prénom Nom"
            />
          </div>

          <div className="form-field">
            <label className="field-label" htmlFor="bio">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              defaultValue={initialData?.bio ?? ""}
              rows={4}
              placeholder="Quelques lignes de présentation..."
            />
          </div>

          <div className="form-field">
            <label className="field-label" htmlFor="photoId">
              Photo
            </label>
            <select id="photoId" name="photoId" defaultValue={initialData?.photoId ?? ""}>
              <option value="">Aucune photo</option>
              {images.map((img) => (
                <option key={img.id} value={img.id}>
                  {img.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-actions">
          <Link href="/admin/auteurs" className="button">
            Annuler
          </Link>
          <button type="submit" className="button primary" disabled={isPending}>
            {isPending ? "Enregistrement..." : isEdit ? "Mettre à jour" : "Créer l'auteur"}
          </button>
        </div>
      </div>
    </form>
  );
}
