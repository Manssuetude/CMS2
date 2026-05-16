import { contentRepository } from "@/repositories/contentRepository";
import { listRelations, relateEntities } from "@/repositories/baseEntityRepository";

export const themesRepository = {
  list: contentRepository.listThemes.bind(contentRepository),
  get: contentRepository.getTheme.bind(contentRepository),
  relations: (id: string) => listRelations("theme", id),
  relate: relateEntities,
};
