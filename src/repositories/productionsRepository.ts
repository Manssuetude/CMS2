import { contentRepository } from "@/repositories/contentRepository";
import { listRelations, relateEntities } from "@/repositories/baseEntityRepository";

export const productionsRepository = {
  list: contentRepository.listProductions.bind(contentRepository),
  get: contentRepository.getProduction.bind(contentRepository),
  relations: (id: string) => listRelations("production", id),
  relate: relateEntities,
};
