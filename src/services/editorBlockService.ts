import type { BlockDefinition } from "@/components/blocks/blockRegistry";
import { blockRegistry } from "@/components/blocks/blockRegistry";
import type { ContentBlock } from "@/types/cms";

function getLabel(block: ContentBlock) {
  return blockRegistry.find((item) => item.type === block.type)?.label || block.type;
}

function createFromDefinition(definition: BlockDefinition): ContentBlock {
  const base = {
    id: `${definition.type}-${Date.now()}`,
    type: definition.type,
    visible: true,
  };

  if (definition.type === "cta") {
    return { ...base, variant: "primary", label: "Nouveau CTA", target: "FORM:join" } as ContentBlock;
  }

  if (definition.type === "feed") {
    return { ...base, source: "productions", variant: "compact", limit: 3 } as ContentBlock;
  }

  if (definition.type === "gallery") {
    return { ...base, mediaIds: [], variant: "grid" } as ContentBlock;
  }

  if (definition.type === "quote") {
    return { ...base, value: "Nouvelle citation" } as ContentBlock;
  }

  if (definition.type === "editorial") {
    return { ...base, variant: "light", title: "Nouveau bloc", body: "Texte à compléter." } as ContentBlock;
  }

  return { ...base, variant: "editorial", title: "Nouveau hero", text: "Texte à compléter." } as ContentBlock;
}

function duplicate(block: ContentBlock): ContentBlock {
  return { ...block, id: `${block.id}-copy-${Date.now()}` } as ContentBlock;
}

function move(blocks: ContentBlock[], blockId: string | undefined, direction: -1 | 1) {
  const index = blocks.findIndex((block) => block.id === blockId);
  const nextIndex = index + direction;
  if (index < 0 || nextIndex < 0 || nextIndex >= blocks.length) return blocks;

  const copy = [...blocks];
  const [item] = copy.splice(index, 1);
  copy.splice(nextIndex, 0, item);
  return copy;
}

function patch(block: ContentBlock, patchValue: Partial<ContentBlock>): ContentBlock {
  return { ...block, ...patchValue } as ContentBlock;
}

export const editorBlockService = {
  createFromDefinition,
  duplicate,
  getLabel,
  move,
  patch,
};
