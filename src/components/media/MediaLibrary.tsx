import type { Media } from "@/types/cms";
import { ImportWizard } from "@/components/media/ImportWizard";

function mediaPreview(media: Media) {
  if (media.type === "image") {
    return (
      <img src={media.thumbnailUrl || media.previewUrl || media.url} alt={media.alt || media.title} loading="lazy" />
    );
  }
  return <span className="media-kind">{media.type.toUpperCase()}</span>;
}

export function MediaLibrary({ media }: { media: Media[] }) {
  const unused = media.filter((item) => !item.caption && !item.description);
  const withoutAlt = media.filter((item) => item.type === "image" && !item.alt);

  return (
    <div className="media-library">
      <ImportWizard />
      <section className="admin-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Bibliothèque média</p>
            <h1>Médiathèque</h1>
          </div>
          <div className="media-metrics">
            <span>{media.length} médias</span>
            <span>{withoutAlt.length} sans alt</span>
            <span>{unused.length} à qualifier</span>
          </div>
        </div>
        <div className="media-filters">
          <input placeholder="Rechercher un média, tag, type..." aria-label="Rechercher dans la médiathèque" />
          <select aria-label="Filtrer par type">
            <option>Tous les types</option>
            <option>Images</option>
            <option>PDF</option>
            <option>Vidéos</option>
            <option>Documents</option>
          </select>
          <select aria-label="Filtrer par source">
            <option>Toutes les sources</option>
            <option>Upload</option>
            <option>Google Drive</option>
            <option>YouTube</option>
            <option>Vimeo</option>
          </select>
        </div>
        <div className="media-grid">
          {media.map((item) => (
            <article className="media-card" key={item.id}>
              <div className="media-thumb">{mediaPreview(item)}</div>
              <div className="media-card-body">
                <strong>{item.title}</strong>
                <p>{item.filename}</p>
                <div className="tags">
                  {item.tags.slice(0, 3).map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                <div className="media-actions">
                  <a className="button" href={item.url} target="_blank" rel="noreferrer">
                    Prévisualiser
                  </a>
                  <button className="button" type="button">
                    Remplacer
                  </button>
                  <button className="button" type="button">
                    Copier le lien
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
