import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Hero } from "@/components/public/Hero";
import { ProposeSection } from "@/components/public/ProposeSection";
import { pageRepository } from "@/repositories/pageRepository";
import { activityFormatRepository } from "@/repositories/activityFormatRepository";
import { resolveActivityFormatIcon } from "@/utils/activityFormatIcons";
import { MaintenanceNotice } from "@/components/public/MaintenanceNotice";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await pageRepository.getPage("activites");
    if (!page) return {};
    return {
      title: { absolute: page.seoTitle ?? page.title },
      description: page.seoDescription ?? undefined,
    };
  } catch {
    return {};
  }
}

export default async function ActivitesPage() {
  try {
    const [page, formats] = await Promise.all([
      pageRepository.getPage("activites"),
      activityFormatRepository.listFormats(),
    ]);
    if (!page) notFound();

    return (
      <>
        <Hero
          eyebrow={page.eyebrow}
          title={page.title}
          body={page.body}
          imageUrl={page.imageUrl ?? undefined}
          imageCrop={page.imageCrop}
          quote={page.quote}
        />
        {formats.length > 0 && (
          <section className="section">
            <div className="format-grid">
              {formats.map((format) => {
                const Icon = resolveActivityFormatIcon(format.icon);
                return (
                  <article className="format-card" key={format.id}>
                    <div className="format-card-icon" aria-hidden="true">
                      <Icon size={22} strokeWidth={1.75} />
                    </div>
                    <h2>{format.title}</h2>
                    {format.description && <p>{format.description}</p>}
                  </article>
                );
              })}
            </div>
          </section>
        )}
        <ProposeSection
          lead="Vous avez une idée d'activité à proposer ?"
          label="Proposer une activité"
          target="FORM:activity"
        />
      </>
    );
  } catch (error) {
    if ((error as { digest?: string })?.digest === "NEXT_NOT_FOUND") throw error;
    return <MaintenanceNotice />;
  }
}
