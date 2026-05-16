import { contentRepository } from "@/repositories/contentRepository";
import { listRelations, relateEntities } from "@/repositories/baseEntityRepository";

export const activitiesRepository = {
  list: contentRepository.listActivities.bind(contentRepository),
  relations: (id: string) => listRelations("activity", id),
  relate: relateEntities,
};
