import { blockRegistry } from "@/components/blocks/blockRegistry";

export default function AdminDesignSystem() {
  return (
    <section className="admin-panel">
      <p className="eyebrow">Design verrouillé</p>
      <h1>Design System</h1>
      <p className="muted">
        L’admin personnalise les contenus, variantes, médias et CTA sans manipuler le HTML, le CSS ou des champs
        techniques.
      </p>
      <div className="block-registry-grid">
        {blockRegistry.map((block) => (
          <article className="admin-card" key={block.type}>
            <p className="eyebrow">{block.type}</p>
            <h2>{block.label}</h2>
            <p>{block.description}</p>
            <div className="tags">
              {block.variants.map((variant) => (
                <span key={variant}>{variant}</span>
              ))}
            </div>
            <small>Réglages : {block.allowedSettings.join(", ")}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
