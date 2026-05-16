import type { EntityRelation, EntityType } from "@/types/cms";
import { relationService } from "@/services/relationService";

export type GraphNode = { id: string; type: EntityType; label?: string };
export type GraphEdge = { from: string; to: string; weight: number; kind: string };

export const graphService = {
  async buildNeighborhood(entityType: EntityType, entityId: string) {
    const relations = await relationService.forEntity(entityType, entityId);
    return this.toGraph(entityType, entityId, relations);
  },

  toGraph(entityType: EntityType, entityId: string, relations: EntityRelation[]) {
    const nodes = new Map<string, GraphNode>();
    nodes.set(`${entityType}:${entityId}`, { id: entityId, type: entityType });
    const edges: GraphEdge[] = [];

    for (const relation of relations) {
      const from = `${relation.fromType}:${relation.fromId}`;
      const to = `${relation.toType}:${relation.toId}`;
      nodes.set(from, { id: relation.fromId, type: relation.fromType });
      nodes.set(to, { id: relation.toId, type: relation.toType });
      edges.push({ from, to, weight: relation.weight, kind: relation.kind });
    }

    return { nodes: [...nodes.values()], edges };
  },
};
