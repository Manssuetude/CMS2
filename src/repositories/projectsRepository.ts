import { contentRepository } from "@/repositories/contentRepository";
import { listRelations, relateEntities } from "@/repositories/baseEntityRepository";

export const projectsRepository = {
  list: contentRepository.listProjects.bind(contentRepository),
  relations: (id: string) => listRelations("project", id),
  relate: relateEntities,
};
