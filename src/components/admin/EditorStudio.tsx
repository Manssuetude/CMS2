"use client";

import { useMemo, useState, useTransition } from "react";
import { blockRegistry, defaultHomepageBlocks } from "@/components/blocks/blockRegistry";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { BlockSettings } from "@/components/admin/BlockSettings";
import { editorBlockService } from "@/services/editorBlockService";
import type { ContentBlock, Media } from "@/types/cms";

const BLOCK_TYPE_LABELS: Record<string, string> = {
  hero: "Hero",
  editorial: "Bloc éditorial",
  feed: "Flux dynamique",
  gallery: "Galerie",
  quote: "Citation",
  cta: "CTA",
  heading: "Titre",
  paragraph: "Paragraphe",
  image: "Image",
  file: "Fichier",
  video: "Vidéo",
  timeline: "Frise chronologique",
  faq: "FAQ",
  references: "Références",
  list: "Liste",
};

export function EditorStudio({
  initialBlocks,
  media,
  title = "Studio éditorial",
  pageSlug,
  onPublish,
}: {
  initialBlocks?: ContentBlock[];
  media: Media[];
  title?: string;
  pageSlug?: string;
  onPublish?: (slug: string, blocks: ContentBlock[]) => Promise<void>;
}) {
  const [blocks, setBlocks] = useState<ContentBlock[]>(initialBlocks?.length ? initialBlocks : defaultHomepageBlocks());
  const [selectedId, setSelectedId] = useState(blocks[0]?.id ?? "");
  const selected = useMemo(() => blocks.find((b) => b.id === selectedId) ?? blocks[0], [blocks, selectedId]);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function updateSelected(patch: Partial<ContentBlock>) {
    setBlocks((items) =>
      items.map((item) => (item.id === selected?.id ? editorBlockService.patch(item, patch) : item)),
    );
    setSaved(false);
  }

  function moveSelected(dir: -1 | 1) {
    if (!selected) return;
    setBlocks((items) => editorBlockService.move(items, selected.id ?? "", dir));
    setSaved(false);
  }

  function duplicateSelected() {
    if (!selected) return;
    const clone = editorBlockService.duplicate(selected);
    const index = blocks.findIndex((b) => b.id === selected.id);
    setBlocks([...blocks.slice(0, index + 1), clone, ...blocks.slice(index + 1)]);
    setSelectedId(clone.id ?? "");
    setSaved(false);
  }

  function removeSelected() {
    if (!selected || blocks.length <= 1) return;
    const index = blocks.findIndex((b) => b.id === selected.id);
    const next = blocks[index - 1] ?? blocks[index + 1];
    setBlocks((items) => items.filter((b) => b.id !== selected.id));
    setSelectedId(next?.id ?? "");
    setSaved(false);
  }

  function toggleVisible() {
    updateSelected({ visible: !("visible" in selected ? selected.visible !== false : true) } as Partial<ContentBlock>);
  }

  function blockLabel(block: ContentBlock) {
    if (block.type === "hero" && block.title) return block.title;
    if (block.type === "editorial" && block.title) return block.title;
    if (block.type === "editorial") return block.body?.slice(0, 32) + "...";
    if (block.type === "feed") return `Flux : ${block.source}`;
    if (block.type === "quote") return `« ${block.value?.slice(0, 28)}... »`;
    if (block.type === "cta") return block.label;
    return BLOCK_TYPE_LABELS[block.type] ?? block.type;
  }

  const isHidden = selected && "visible" in selected && selected.visible === false;

  return (
    <section className="editor-studio" data-tour="tour-editor">
      <header className="editor-toolbar">
        <div>
          <p className="eyebrow">Éditeur de structure</p>
          <h1>{title}</h1>
        </div>
        <div className="editor-actions">
          <button className="button" type="button" disabled>
            Aperçu mobile
          </button>
          <button className="button" type="button" disabled>
            Prévisualiser
          </button>
          <button
            className="button primary"
            type="button"
            disabled={isPending || !onPublish || !pageSlug}
            onClick={() => {
              if (!onPublish || !pageSlug) return;
              setSaved(false);
              startTransition(async () => {
                await onPublish(pageSlug, blocks);
                setSaved(true);
              });
            }}
          >
            {isPending ? "Publication..." : saved ? "Publié !" : "Publier"}
          </button>
        </div>
      </header>

      <div className="editor-shell">
        {/* Structure */}
        <aside className="editor-structure" aria-label="Structure de la page">
          <h2>Structure</h2>
          {blocks.map((block, index) => {
            const hidden = "visible" in block && block.visible === false;
            return (
              <button
                key={block.id ?? `${block.type}-${index}`}
                type="button"
                className={[selected?.id === block.id ? "is-selected" : "", hidden ? "is-hidden-block" : ""]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setSelectedId(block.id ?? "")}
                title={hidden ? "Bloc masqué" : undefined}
              >
                <span>{index + 1}</span>
                <strong>{blockLabel(block)}</strong>
                <small>{BLOCK_TYPE_LABELS[block.type] ?? block.type}</small>
              </button>
            );
          })}

          <div className="block-library">
            <h3>Ajouter un bloc</h3>
            {blockRegistry.map((def) => (
              <button
                key={def.type}
                type="button"
                title={def.description}
                onClick={() => {
                  const block = editorBlockService.createFromDefinition(def);
                  setBlocks((items) => [...items, block]);
                  setSelectedId(block.id ?? "");
                  setSaved(false);
                }}
              >
                {def.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Aperçu */}
        <main className="editor-preview" aria-label="Aperçu">
          {blocks.map((block) => (
            <div
              key={block.id ?? block.type}
              className={`editor-preview-item${selected?.id === block.id ? " is-selected-preview" : ""}`}
              onClick={() => setSelectedId(block.id ?? "")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setSelectedId(block.id ?? "")}
              aria-label={`Sélectionner le bloc ${blockLabel(block)}`}
            >
              <BlockRenderer block={block} />
            </div>
          ))}
        </main>

        {/* Réglages */}
        <aside className="editor-settings" aria-label="Réglages du bloc sélectionné">
          <h2>Réglages</h2>
          {selected ? (
            <>
              <p className="settings-pill">{BLOCK_TYPE_LABELS[selected.type] ?? selected.type}</p>
              {isHidden && <p className="settings-hint">Ce bloc est masqué sur le site public.</p>}
              <BlockSettings
                block={selected}
                media={media}
                onChange={updateSelected}
                onMove={moveSelected}
                onDuplicate={duplicateSelected}
                onToggleVisible={toggleVisible}
              />
              <button
                className="button danger"
                type="button"
                onClick={removeSelected}
                disabled={blocks.length <= 1}
                style={{ marginTop: 8 }}
              >
                Supprimer ce bloc
              </button>
            </>
          ) : (
            <p className="settings-hint">Sélectionnez un bloc dans l'aperçu ou la structure.</p>
          )}
        </aside>
      </div>
    </section>
  );
}
