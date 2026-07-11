import Link from "next/link";

type CardItem = {
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  href: string;
  meta?: string | null;
  tags?: string[];
};

export function CardGrid({ title, items }: { title: string; items: CardItem[] }) {
  return (
    <section className="section">
      <div className="section-head">
        <h2>{title}</h2>
      </div>
      <div className="grid">
        {items.map((item) => (
          <Link className="card" href={item.href} key={item.href}>
            {item.imageUrl ? (
              <span className="card-image">
                <img src={item.imageUrl} alt={item.title} loading="lazy" />
              </span>
            ) : null}
            <span className="card-body">
              {item.meta ? <span className="meta">{item.meta}</span> : null}
              <h3>{item.title}</h3>
              {item.description ? <span className="card-desc">{item.description}</span> : null}
              {item.tags?.length ? (
                <span className="tags">
                  {item.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </span>
              ) : null}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
