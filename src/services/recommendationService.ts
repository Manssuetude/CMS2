import type { EntityRelation, EntityType } from "@/types/cms";
import { relationService } from "@/services/relationService";

export const recommendationService = {
  async recommend(entityType: EntityType, entityId: string, limit = 6) {
    const relations = await relationService.forEntity(entityType, entityId);
    return this.rank(relations, entityType, entityId).slice(0, limit);
  },

  rank(relations: EntityRelation[], entityType: EntityType, entityId: string) {
    return relations
      .map((relation) => {
        const isOrigin = relation.fromType === entityType && relation.fromId === entityId;
        return {
          type: isOrigin ? relation.toType : relation.fromType,
          id: isOrigin ? relation.toId : relation.fromId,
          kind: relation.kind,
          score: relation.kind === "recommended" ? relation.weight + 30 : relation.weight,
        };
      })
      .sort((a, b) => b.score - a.score);
  },
};
