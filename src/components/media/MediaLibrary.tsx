"use client";

import { useState } from "react";
import type { Media } from "@/types/cms";
import { ImportWizard } from "@/components/media/ImportWizard";
import { deleteMediaAction, renameMediaAction } from "@/app/admin/media/actions";
import { MediaCard } from "@/components/media/MediaCard";

export function MediaLibrary({ media }: { media: Media[] }) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const filtered = media.filter((item) => {
    const q = query.toLowerCase();
    const matchesQuery =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.filename.toLowerCase().includes(q) ||
      item.alt?.toLowerCase().includes(q) ||
      item.tags.some((t) => t.toLowerCase().includes(q));
    const matchesType = !typeFilter || item.type === typeFilter;
    return matchesQuery && matchesType;
  });

  const withoutAlt = media.filter((item) => item.type === "image" && !item.alt);
  const drafts = media.filter((item) => item.visibility === "draft");

  return (
    <div className="media-library">
      <ImportWizard />
      <section className="admin-panel">
        <div className="admin-page-header">
          <div>
            <h1>Mediatheque</h1>
            <p>
              {filtered.length} media{filtered.length !== 1 ? "s" : ""}
              {query || typeFilter ? ` sur ${media.length}` : ""}
            </p>
          </div>
          <div className="media-metrics">
            <span>{media.length} total</span>
            {withoutAlt.length > 0 && (
              <span style={{ background: "var(--amber-soft, #fef3c7)", color: "#92400e" }}>
                {withoutAlt.length} sans alt
              </span>
            )}
            {drafts.length > 0 && (
              <span>
                {drafts.length} brouillon{drafts.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        {media.length === 0 ? (
          <div className="admin-empty">
            <strong>Aucun media dans la bibliotheque</strong>
            <p>Utilisez le formulaire ci-dessus pour importer votre premier fichier.</p>
          </div>
        ) : (
          <>
            <div className="media-filters">
              <input
                placeholder="Rechercher un media, tag, type..."
                aria-label="Rechercher dans la mediatheque"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <select aria-label="Filtrer par type" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="">Tous les types</option>
                <option value="image">Images</option>
                <option value="pdf">PDF</option>
                <option value="video">Videos</option>
                <option value="document">Documents</option>
              </select>
            </div>
            {filtered.length === 0 ? (
              <div className="admin-empty">
                <strong>Aucun resultat pour &quot;{query}&quot;</strong>
                <p>Essayez un autre terme ou supprimez le filtre.</p>
              </div>
            ) : (
              <div className="media-grid">
                {filtered.map((item) => (
                  <MediaCard
                    key={item.id}
                    item={item}
                    deleteAction={deleteMediaAction}
                    renameAction={renameMediaAction}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
