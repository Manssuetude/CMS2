"use client";

import type { Media } from "@/types/cms";

interface Props {
  item: Media;
  deleteAction: (formData: FormData) => Promise<void>;
}

function MediaPreview({ item }: { item: Media }) {
  if (item.type === "image") {
    return (
      <img
        src={item.thumbnailUrl ?? item.previewUrl ?? item.url}
        alt={item.alt ?? item.title}
        loading="lazy"
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    );
  }
  return <span className="media-kind">{item.type.toUpperCase()}</span>;
}

export function MediaCard({ item, deleteAction }: Props) {
  function copyUrl() {
    navigator.clipboard.writeText(item.url).catch(() => undefined);
  }

  return (
    <article className="media-card">
      <div className="media-thumb">
        <MediaPreview item={item} />
      </div>
      <div className="media-card-body">
        <strong style={{ fontSize: 13, lineHeight: 1.3 }}>{item.title}</strong>
        <p
          style={{
            fontSize: 12,
            margin: 0,
            color: "var(--muted)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {item.filename}
        </p>
        {item.size && <p style={{ fontSize: 11, margin: 0, color: "var(--muted)" }}>{item.size}</p>}
        {item.tags.length > 0 && (
          <div className="tags" style={{ flexWrap: "wrap", gap: 4 }}>
            {item.tags.slice(0, 4).map((tag) => (
              <span key={tag} style={{ fontSize: 11 }}>
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="media-actions" style={{ marginTop: 8 }}>
          <a className="btn-sm" href={item.url} target="_blank" rel="noreferrer">
            Ouvrir
          </a>
          <button className="btn-sm" type="button" onClick={copyUrl}>
            Copier URL
          </button>
          <form action={deleteAction} style={{ display: "contents" }}>
            <input type="hidden" name="id" value={item.id} />
            <button
              className="btn-sm btn-danger"
              type="submit"
              onClick={(e) => {
                if (!confirm(`Supprimer « ${item.title} » ?`)) e.preventDefault();
              }}
            >
              Supprimer
            </button>
          </form>
        </div>
      </div>
    </article>
  );
}
