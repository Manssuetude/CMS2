import { MediaLibrary } from "@/components/media/MediaLibrary";
import { mediaRepository } from "@/repositories/mediaRepository";
import { mediaUsageService } from "@/services/mediaUsageService";

export default async function AdminMedia({ searchParams }: { searchParams: Promise<{ media?: string }> }) {
  const { media: selectedId } = await searchParams;
  const media = await mediaRepository.list();
  // « Utilisé dans » : jamais bloquant (la médiathèque reste utilisable sans).
  const usage = await mediaUsageService.getUsage(media.map((m) => m.id)).catch(() => null);
  return <MediaLibrary media={media} usage={usage} initialSelectedId={selectedId ?? null} />;
}
