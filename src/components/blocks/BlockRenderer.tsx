import type { ContentBlock } from "@/types/cms";

export function BlockRenderer({ block }: { block: ContentBlock }) {
  if ("visible" in block && block.visible === false) return null;

  if (block.type === "hero") {
    return (
      <section className={`cms-preview-block cms-preview-hero is-${block.variant}`}>
        <p className="eyebrow">Hero</p>
        <h2>{block.title}</h2>
        {block.text ? <p>{block.text}</p> : null}
        {block.cta ? <span className="button primary">CTA : {block.cta}</span> : null}
      </section>
    );
  }

  if (block.type === "editorial") {
    return (
      <section className={`cms-preview-block is-${block.variant}`}>
        {block.title ? <h2>{block.title}</h2> : null}
        <p>{block.body}</p>
      </section>
    );
  }

  if (block.type === "feed") {
    return (
      <section className="cms-preview-block">
        <p className="eyebrow">Flux {block.source}</p>
        <div className={`cms-preview-feed is-${block.variant}`}>
          {Array.from({ length: block.limit || 3 }).map((_, index) => (
            <article key={index}>
              <span>{block.source}</span>
              <strong>Contenu relié {index + 1}</strong>
              <p>Ce bloc sera alimenté automatiquement par le graphe éditorial.</p>
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (block.type === "gallery") {
    return (
      <section className="cms-preview-block">
        <p className="eyebrow">Galerie</p>
        <div className="cms-preview-gallery">
          {block.mediaIds.map((id) => (
            <span key={id}>{id}</span>
          ))}
        </div>
      </section>
    );
  }

  if (block.type === "quote") {
    return (
      <blockquote className="cms-preview-block cms-preview-quote">
        “{block.value}”{block.source ? <cite>{block.source}</cite> : null}
      </blockquote>
    );
  }

  if (block.type === "cta") {
    return (
      <section className={`cms-preview-block cms-preview-cta is-${block.variant}`}>
        <strong>{block.label}</strong>
        <span>{block.target}</span>
      </section>
    );
  }

  return (
    <section className="cms-preview-block">
      <p className="eyebrow">{block.type}</p>
    </section>
  );
}
