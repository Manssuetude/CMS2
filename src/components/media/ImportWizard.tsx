"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

const SOURCES = [
  ["computer", "Ordinateur"],
  ["google-drive", "Google Drive"],
  ["video", "YouTube / Vimeo"],
  ["url", "URL externe"],
  ["library", "Médiathèque"],
] as const;

type SourceId = (typeof SOURCES)[number][0];

export function ImportWizard() {
  const [source, setSource] = useState<SourceId>("computer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const form = e.currentTarget;
      const fd = new FormData(form);
      const res = await fetch("/api/media", { method: "POST", body: fd });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? `Erreur ${res.status}`);
      }
      form.reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'import.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="import-wizard">
      <div>
        <p className="eyebrow">Import</p>
        <h2>Ajouter un média</h2>
      </div>
      <div className="wizard-sources">
        {SOURCES.map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={source === id ? "is-selected" : ""}
            onClick={() => {
              setSource(id);
              setError(null);
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="wizard-panel">
        {source === "computer" ? (
          <form ref={formRef} onSubmit={handleUpload} className="form-grid">
            <label>
              Fichier
              <input name="file" type="file" required />
            </label>
            <label>
              Titre public
              <input name="title" placeholder="Nom visible dans le CMS" />
            </label>
            <label>
              Texte alternatif
              <input name="alt" placeholder="Description courte de l'image" />
            </label>
            <label>
              Tags
              <input name="tags" placeholder="production, PERCA, séance" />
            </label>
            <label>
              Description
              <textarea name="description" placeholder="Usage, contexte, droits, source..." />
            </label>
            <label>
              Visibilité
              <select name="visibility" defaultValue="draft">
                <option value="draft">Brouillon</option>
                <option value="public">Public</option>
                <option value="private">Privé</option>
              </select>
            </label>
            {error && <p style={{ color: "var(--error, #b91c1c)", margin: 0 }}>{error}</p>}
            <button className="button primary" type="submit" disabled={loading}>
              {loading ? "Import en cours…" : "Importer dans la médiathèque"}
            </button>
          </form>
        ) : source === "video" ? (
          <form ref={formRef} onSubmit={handleUpload} className="form-grid">
            <input type="hidden" name="type" value="video" />
            <label>
              URL YouTube ou Vimeo
              <input name="externalUrl" type="url" required placeholder="https://www.youtube.com/watch?v=..." />
            </label>
            <label>
              Titre (optionnel)
              <input name="title" placeholder="Récupéré automatiquement si laissé vide" />
            </label>
            <label>
              Tags
              <input name="tags" placeholder="conférence, PERCA, 2026" />
            </label>
            <label>
              Visibilité
              <select name="visibility" defaultValue="public">
                <option value="draft">Brouillon</option>
                <option value="public">Public</option>
                <option value="private">Privé</option>
              </select>
            </label>
            {error && <p style={{ color: "var(--error, #b91c1c)", margin: 0 }}>{error}</p>}
            <button className="button primary" type="submit" disabled={loading}>
              {loading ? "Import en cours…" : "Ajouter la vidéo"}
            </button>
          </form>
        ) : source === "url" ? (
          <form ref={formRef} onSubmit={handleUpload} className="form-grid">
            <input type="hidden" name="type" value="document" />
            <label>
              URL externe
              <input name="externalUrl" type="url" required placeholder="https://…" />
            </label>
            <label>
              Titre
              <input name="title" placeholder="Nom dans la médiathèque" />
            </label>
            <label>
              Tags
              <input name="tags" placeholder="rapport, 2024" />
            </label>
            <label>
              Visibilité
              <select name="visibility" defaultValue="public">
                <option value="draft">Brouillon</option>
                <option value="public">Public</option>
                <option value="private">Privé</option>
              </select>
            </label>
            {error && <p style={{ color: "var(--error, #b91c1c)", margin: 0 }}>{error}</p>}
            <button className="button primary" type="submit" disabled={loading}>
              {loading ? "Enregistrement…" : "Ajouter le lien"}
            </button>
          </form>
        ) : (
          <div className="wizard-placeholder">
            <strong>{SOURCES.find(([id]) => id === source)?.[1]}</strong>
            <p>
              Ce flux est prévu dans l&apos;architecture. En production, cette étape ouvrira le sélecteur correspondant,
              récupérera les métadonnées, puis ajoutera le média à la médiathèque.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
