type HealthItem = {
  label: string;
  value: number;
  severity: string;
};

export function HealthCenter({ items }: { items: HealthItem[] }) {
  return (
    <section className="section admin-panel health-center">
      <div className="section-head">
        <div>
          <p className="eyebrow">CMS Health Center</p>
          <h2>Qualité du site</h2>
        </div>
      </div>
      <div className="health-grid">
        {items.map((item) => (
          <article key={item.label} className={`health-item is-${item.severity}`}>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </article>
        ))}
      </div>
      <p className="muted">
        Ce panneau repère les oublis éditoriaux avant publication : SEO, alt text, brouillons et demandes non traitées.
      </p>
    </section>
  );
}
