"use client";

import type { ContentBlock } from "@/types/cms";
import type { Media } from "@/types/cms";

const SOURCE_LABELS: Record<string, string> = {
  productions: "Productions",
  projects: "Projets",
  resources: "Ressources",
  activities: "Activités",
};

const HERO_VARIANTS = ["minimal", "editorial", "immersive", "dark", "split"];
const EDITORIAL_VARIANTS = ["light", "cream", "dark", "split"];
const FEED_VARIANTS = ["compact", "featured", "editorial", "media", "masonry"];
const GALLERY_VARIANTS = ["grid", "masonry", "editorial"];
const CTA_VARIANTS = ["primary", "secondary", "ghost", "premium-black"];

interface Props {
  block: ContentBlock;
  media: Media[];
  onChange: (patch: Partial<ContentBlock>) => void;
  onMove: (dir: -1 | 1) => void;
  onDuplicate: () => void;
  onToggleVisible: () => void;
}

export function BlockSettings({ block, onChange, onMove, onDuplicate, onToggleVisible }: Props) {
  const isHidden = "visible" in block && block.visible === false;

  function field(label: string, input: React.ReactNode) {
    return (
      <label className="settings-field">
        <span>{label}</span>
        {input}
      </label>
    );
  }

  function variantSelect(options: string[], value: string) {
    return (
      <select value={value} onChange={(e) => onChange({ variant: e.target.value } as Partial<ContentBlock>)}>
        {options.map((v) => (
          <option key={v} value={v}>
            {v}
          </option>
        ))}
      </select>
    );
  }

  return (
    <div className="block-settings-inner">
      {block.type === "hero" && (
        <>
          {field(
            "Titre",
            <input
              value={block.title}
              onChange={(e) => onChange({ title: e.target.value } as Partial<ContentBlock>)}
            />,
          )}
          {field(
            "Texte d'accroche",
            <textarea
              rows={3}
              value={block.text ?? ""}
              onChange={(e) => onChange({ text: e.target.value } as Partial<ContentBlock>)}
            />,
          )}
          {field("Variante", variantSelect(HERO_VARIANTS, block.variant))}
          {field(
            "Lien CTA",
            <input
              placeholder="FORM:join ou /une-page"
              value={block.cta ?? ""}
              onChange={(e) => onChange({ cta: e.target.value } as Partial<ContentBlock>)}
            />,
          )}
        </>
      )}

      {block.type === "editorial" && (
        <>
          {field(
            "Titre (optionnel)",
            <input
              value={block.title ?? ""}
              onChange={(e) => onChange({ title: e.target.value } as Partial<ContentBlock>)}
            />,
          )}
          {field(
            "Corps de texte",
            <textarea
              rows={5}
              value={block.body}
              onChange={(e) => onChange({ body: e.target.value } as Partial<ContentBlock>)}
            />,
          )}
          {field("Variante", variantSelect(EDITORIAL_VARIANTS, block.variant))}
        </>
      )}

      {block.type === "feed" && (
        <>
          {field(
            "Source de contenu",
            <select
              value={block.source}
              onChange={(e) => onChange({ source: e.target.value } as Partial<ContentBlock>)}
            >
              {Object.entries(SOURCE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>,
          )}
          {field(
            "Nombre d'éléments",
            <input
              type="number"
              min={1}
              max={12}
              value={block.limit ?? 3}
              onChange={(e) => onChange({ limit: parseInt(e.target.value, 10) || 3 } as Partial<ContentBlock>)}
            />,
          )}
          {field("Présentation", variantSelect(FEED_VARIANTS, block.variant))}
          <p className="settings-hint">
            Ce bloc affiche automatiquement les {SOURCE_LABELS[block.source] ?? block.source} publiés.
          </p>
        </>
      )}

      {block.type === "quote" && (
        <>
          {field(
            "Citation",
            <textarea
              rows={4}
              value={block.value}
              onChange={(e) => onChange({ value: e.target.value } as Partial<ContentBlock>)}
            />,
          )}
          {field(
            "Auteur / Source",
            <input
              placeholder="Auteur ou source"
              value={block.source ?? ""}
              onChange={(e) => onChange({ source: e.target.value } as Partial<ContentBlock>)}
            />,
          )}
        </>
      )}

      {block.type === "cta" && (
        <>
          {field(
            "Libellé du bouton",
            <input
              value={block.label}
              onChange={(e) => onChange({ label: e.target.value } as Partial<ContentBlock>)}
            />,
          )}
          {field(
            "Destination",
            <input
              placeholder="FORM:join ou /une-page"
              value={block.target}
              onChange={(e) => onChange({ target: e.target.value } as Partial<ContentBlock>)}
            />,
          )}
          {field("Variante", variantSelect(CTA_VARIANTS, block.variant))}
        </>
      )}

      {block.type === "gallery" && (
        <>
          {field("Présentation", variantSelect(GALLERY_VARIANTS, block.variant))}
          <p className="settings-hint">{block.mediaIds.length} média(s) dans la galerie.</p>
        </>
      )}

      {(block.type === "heading" || block.type === "paragraph") && (
        <>
          {field(
            "Contenu",
            <textarea
              rows={3}
              value={block.value}
              onChange={(e) => onChange({ value: e.target.value } as Partial<ContentBlock>)}
            />,
          )}
        </>
      )}

      {(block.type === "file" || block.type === "video") && (
        <>
          {field(
            "Libellé",
            <input
              value={block.label ?? ""}
              onChange={(e) => onChange({ label: e.target.value } as Partial<ContentBlock>)}
            />,
          )}
          {field(
            "URL",
            <input
              value={block.url ?? ""}
              onChange={(e) => onChange({ url: e.target.value } as Partial<ContentBlock>)}
            />,
          )}
        </>
      )}

      <div className="settings-divider" />

      <div className="settings-actions">
        <button className="button" type="button" onClick={() => onMove(-1)}>
          Monter
        </button>
        <button className="button" type="button" onClick={() => onMove(1)}>
          Descendre
        </button>
        <button className="button" type="button" onClick={onDuplicate}>
          Dupliquer
        </button>
        <button className="button" type="button" onClick={onToggleVisible}>
          {isHidden ? "Afficher" : "Masquer"}
        </button>
      </div>
    </div>
  );
}
