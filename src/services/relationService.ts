import type { EntityRelation, EntityType } from "@/types/cms";
import { listRelations, relateEntities } from "@/repositories/baseEntityRepository";

export const relationService = {
  async connect(fromType: EntityType, fromId: string, toType: EntityType, toId: string, weight = 50) {
    return relateEntities({ fromType, fromId, toType, toId, weight });
  },

  async forEntity(entityType: EntityType, entityId: string) {
    return listRelations(entityType, entityId);
  },

  groupByTarget(relations: EntityRelation[]) {
    return relations.reduce<Record<string, EntityRelation[]>>((acc, relation) => {
      const key = `${relation.toType}:${relation.toId}`;
      acc[key] ||= [];
      acc[key].push(relation);
      return acc;
    }, {});
  },
};
