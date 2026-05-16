import { mediaRepository } from "@/repositories/mediaRepository";
import { listRelations, relateEntities } from "@/repositories/baseEntityRepository";

export const resourcesRepository = {
  list: mediaRepository.list.bind(mediaRepository),
  create: mediaRepository.create.bind(mediaRepository),
  relations: (id: string) => listRelations("resource", id),
  relate: relateEntities,
};
