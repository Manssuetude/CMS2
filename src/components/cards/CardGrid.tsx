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
          <article className="card" key={item.href}>
            {item.imageUrl ? (
              <Link className="card-image" href={item.href}>
                <img src={item.imageUrl} alt={item.title} loading="lazy" />
              </Link>
            ) : null}
            <div className="card-body">
              {item.meta ? <p className="meta">{item.meta}</p> : null}
              <h3>
                <Link href={item.href}>{item.title}</Link>
              </h3>
              {item.description ? <p>{item.description}</p> : null}
              {item.tags?.length ? (
                <div className="tags">
                  {item.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
