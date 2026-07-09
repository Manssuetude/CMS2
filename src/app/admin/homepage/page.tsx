import { EditorStudio } from "@/components/admin/EditorStudio";
import { mediaRepository } from "@/repositories/mediaRepository";
import { contentRepository } from "@/repositories/contentRepository";
import { savePageBlocksAction } from "./actions";

export default async function AdminHomepage() {
  const [page, media] = await Promise.all([contentRepository.getPage("accueil"), mediaRepository.list()]);
  return (
    <EditorStudio
      media={media}
      title="Homepage"
      initialBlocks={page?.sections}
      pageSlug="accueil"
      onPublish={savePageBlocksAction}
    />
  );
}
