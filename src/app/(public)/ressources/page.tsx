import { CardGrid } from "@/components/cards/CardGrid";
import { mediaRepository } from "@/repositories/mediaRepository";

export default async function ResourcesPage() {
  let resources: Awaited<ReturnType<typeof mediaRepository.list>> = [];
  try {
    resources = await mediaRepository.list();
  } catch {
    // DB unreachable at build time (e.g. no credentials in CI): ISR will populate on first request.
  }
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Médiathèque</p>
          <h1>Ressources Manssuétude</h1>
          <p>
            Documents, images, rapports, supports, vidéos et ressources réutilisables dans les pages et productions.
          </p>
        </div>
        <div className="hero-image" />
      </section>
      <CardGrid
        title="Ressources"
        items={resources.map((item) => ({
          title: item.title,
          description: item.description || item.caption,
          href: `/ressources/${item.id}`,
          meta: item.type,
          imageUrl: item.type === "image" ? item.url : undefined,
          tags: item.tags,
        }))}
      />
    </>
  );
}
