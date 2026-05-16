import { CtaButton } from "@/components/forms/CtaButton";
import type { Activity, Production, Project, Theme } from "@/types/cms";

type DetailItem = Theme | Production | Project | Activity;

export function DetailPage({ item, eyebrow, backTarget }: { item: DetailItem; eyebrow: string; backTarget: string }) {
  const description = "longDescription" in item ? item.longDescription : item.description;
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{item.title}</h1>
          {description ? <p>{description}</p> : null}
          <div className="actions">
            <CtaButton label="Retour" target={backTarget} variant="secondary" />
            <CtaButton label="Contribuer" target="FORM:content" variant="primary" />
          </div>
        </div>
        <div className="hero-image" />
      </section>
      <section className="section admin-panel">
        {"contentBlocks" in item && item.contentBlocks?.length ? (
          item.contentBlocks.map((block, index) => (
            <p key={index}>{block.type === "paragraph" ? block.value : block.type}</p>
          ))
        ) : (
          <p>{description}</p>
        )}
        {"tags" in item && item.tags?.length ? (
          <div className="tags">
            {item.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        ) : null}
      </section>
    </>
  );
}
