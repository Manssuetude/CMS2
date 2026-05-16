"use client";

import { useMemo, useState } from "react";
import { blockRegistry, defaultHomepageBlocks } from "@/components/blocks/blockRegistry";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { MediaField } from "@/components/media/MediaField";
import { editorBlockService } from "@/services/editorBlockService";
import type { ContentBlock, Media } from "@/types/cms";

export function EditorStudio({
  initialBlocks,
  media,
  title = "Studio éditorial",
}: {
  initialBlocks?: ContentBlock[];
  media: Media[];
  title?: string;
}) {
  const [blocks, setBlocks] = useState<ContentBlock[]>(initialBlocks?.length ? initialBlocks : defaultHomepageBlocks());
  const [selectedId, setSelectedId] = useState(blocks[0]?.id || "");
  const selected = useMemo(() => blocks.find((block) => block.id === selectedId) || blocks[0], [blocks, selectedId]);

  function updateSelected(patch: Partial<ContentBlock>) {
    setBlocks((items) =>
      items.map((item) => (item.id === selected?.id ? editorBlockService.patch(item, patch) : item)),
    );
  }

  function moveSelected(direction: -1 | 1) {
    if (!selected) return;
    setBlocks((items) => editorBlockService.move(items, selected.id, direction));
  }

  function duplicateSelected() {
    if (!selected) return;
    const clone = editorBlockService.duplicate(selected);
    const index = blocks.findIndex((block) => block.id === selected.id);
    setBlocks([...blocks.slice(0, index + 1), clone, ...blocks.slice(index + 1)]);
    setSelectedId(clone.id || "");
  }

  return (
    <section className="editor-studio">
      <header className="editor-toolbar">
        <div>
          <p className="eyebrow">Component-only CMS</p>
          <h1>{title}</h1>
        </div>
        <div className="editor-actions">
          <button className="button" type="button">
            Aperçu mobile
          </button>
          <button className="button" type="button">
            Prévisualiser
          </button>
          <button className="button primary" type="button">
            Publier
          </button>
        </div>
      </header>

      <div className="editor-shell">
        <aside className="editor-structure" aria-label="Structure de la page">
          <h2>Structure</h2>
          {blocks.map((block, index) => (
            <button
              key={block.id || `${block.type}-${index}`}
              type="button"
              className={selected?.id === block.id ? "is-selected" : ""}
              onClick={() => setSelectedId(block.id || "")}
            >
              <span>{index + 1}</span>
              <strong>{editorBlockService.getLabel(block)}</strong>
              <small>{("variant" in block && block.variant) || block.type}</small>
            </button>
          ))}
          <div className="block-library">
            <h3>Ajouter un bloc</h3>
            {blockRegistry.slice(0, 6).map((definition) => (
              <button
                key={definition.type}
                type="button"
                onClick={() => {
                  const block = editorBlockService.createFromDefinition(definition);
                  setBlocks((items) => [...items, block]);
                  setSelectedId(block.id || "");
                }}
              >
                {definition.label}
              </button>
            ))}
          </div>
        </aside>

        <main className="editor-preview" aria-label="Aperçu live">
          {blocks.map((block) => (
            <BlockRenderer key={block.id || block.type} block={block} />
          ))}
        </main>

        <aside className="editor-settings" aria-label="Réglages contextuels">
          <h2>Réglages</h2>
          {selected ? (
            <>
              <p className="settings-pill">{editorBlockService.getLabel(selected)}</p>
              {"title" in selected ? (
                <label>
                  Titre
                  <input
                    value={selected.title || ""}
                    onChange={(event) => updateSelected({ title: event.target.value } as Partial<ContentBlock>)}
                  />
                </label>
              ) : null}
              {"text" in selected ? (
                <label>
                  Texte
                  <textarea
                    value={selected.text || ""}
                    onChange={(event) => updateSelected({ text: event.target.value } as Partial<ContentBlock>)}
                  />
                </label>
              ) : null}
              {"body" in selected ? (
                <label>
                  Corps
                  <textarea
                    value={selected.body || ""}
                    onChange={(event) => updateSelected({ body: event.target.value } as Partial<ContentBlock>)}
                  />
                </label>
              ) : null}
              {"label" in selected ? (
                <label>
                  Libellé
                  <input
                    value={selected.label || ""}
                    onChange={(event) => updateSelected({ label: event.target.value } as Partial<ContentBlock>)}
                  />
                </label>
              ) : null}
              {"target" in selected ? (
                <label>
                  Destination
                  <input
                    value={selected.target || ""}
                    onChange={(event) => updateSelected({ target: event.target.value } as Partial<ContentBlock>)}
                  />
                </label>
              ) : null}
              {"variant" in selected ? (
                <label>
                  Variante
                  <input
                    value={String(selected.variant)}
                    onChange={(event) => updateSelected({ variant: event.target.value } as Partial<ContentBlock>)}
                  />
                </label>
              ) : null}
              {"mediaId" in selected || selected.type === "hero" || selected.type === "image" ? (
                <MediaField
                  label="Média du bloc"
                  value={media.find((item) => "mediaId" in selected && item.id === selected.mediaId) || null}
                />
              ) : null}
              <div className="settings-actions">
                <button className="button" type="button" onClick={() => moveSelected(-1)}>
                  Monter
                </button>
                <button className="button" type="button" onClick={() => moveSelected(1)}>
                  Descendre
                </button>
                <button className="button" type="button" onClick={duplicateSelected}>
                  Dupliquer
                </button>
                <button
                  className="button"
                  type="button"
                  onClick={() =>
                    updateSelected({
                      visible: !("visible" in selected ? selected.visible !== false : true),
                    } as Partial<ContentBlock>)
                  }
                >
                  {"visible" in selected && selected.visible === false ? "Afficher" : "Masquer"}
                </button>
              </div>
            </>
          ) : null}
        </aside>
      </div>
    </section>
  );
}
