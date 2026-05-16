import { EditorStudio } from "@/components/admin/EditorStudio";
import { mediaRepository } from "@/repositories/mediaRepository";

export default async function AdminHomepage() {
  const media = await mediaRepository.list();
  return <EditorStudio media={media} title="Homepage" />;
}
