import { MediaLibrary } from "@/components/media/MediaLibrary";
import { mediaRepository } from "@/repositories/mediaRepository";

export default async function AdminMedia() {
  const media = await mediaRepository.list();
  return <MediaLibrary media={media} />;
}
