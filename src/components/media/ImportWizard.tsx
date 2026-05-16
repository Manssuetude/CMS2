"use client";

import { useState } from "react";

const sources = [
  ["computer", "Ordinateur"],
  ["google-drive", "Google Drive"],
  ["video", "YouTube / Vimeo"],
  ["url", "URL externe"],
  ["library", "Médiathèque"],
];

export function ImportWizard() {
  const [source, setSource] = useState("computer");

  return (
    <section className="import-wizard">
      <div>
        <p className="eyebrow">Import Wizard</p>
        <h2>Ajouter un média sans chemin technique</h2>
      </div>
      <div className="wizard-sources">
        {sources.map(([id, label]) => (
          <button key={id} type="button" className={source === id ? "is-selected" : ""} onClick={() => setSource(id)}>
            {label}
          </button>
        ))}
      </div>
      <div className="wizard-panel">
        {source === "computer" ? (
          <form action="/api/media" method="post" encType="multipart/form-data" className="form-grid">
            <label>
              Fichier
              <input name="file" type="file" required />
            </label>
            <label>
              Titre public
              <input name="title" placeholder="Nom visible dans le CMS" />
            </label>
            <label>
              Alt text
              <input name="alt" placeholder="Description courte de l’image" />
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
            <button className="button primary" type="submit">
              Importer et ajouter à la médiathèque
            </button>
          </form>
        ) : (
          <div className="wizard-placeholder">
            <strong>{sources.find(([id]) => id === source)?.[1]}</strong>
            <p>
              Le flux est prévu dans l’architecture. En production, cette étape ouvrira le sélecteur correspondant,
              récupérera les métadonnées, puis ajoutera le média à la médiathèque.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
